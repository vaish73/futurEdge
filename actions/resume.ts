"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ProfileModel from "@/models/Profile";
import { getServerSession, Profile } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ResumeModel from "@/models/Resume";
import { revalidatePath } from "next/cache";
import { IResume } from '../src/models/Resume';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content: string): Promise<IResume> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(session);

  const userId = session.user.id;

  const profile = (await ProfileModel.findOne({
    userId,
  }).lean()) as Profile | null;

  if (!profile) {
    throw new Error("User doesn't exist")
  }

  try {
    const resume = await ResumeModel.findOneAndUpdate({
      userId
    }, {
      content,
      atsScore: 0,
      feedback: "Not generated Yet",
    }, { upsert: true, new: true, setDefaultsOnInsert: true })
    if (!resume) {
      throw new Error("Error creating Resume or resume not found")
    }
    revalidatePath("/resume");

    const plainResume = resume.toObject();

    // ✨ Fix ObjectId fields
    plainResume._id = plainResume._id.toString();
    plainResume.userId = plainResume.userId.toString();

    return plainResume;

  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume(): Promise<IResume | null> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(session);

  const userId = session.user.id;

  const profile = (await ProfileModel.findOne({
    userId,
  }).lean()) as Profile | null;

  if (!profile) {
    throw new Error("User doesn't exist")
  }

  const resume = await ResumeModel.findOne({ userId });

  if(!resume) return null;

  const leanResume = resume.toObject(); 
  return leanResume;
}

interface ImproveAIInput {
  current: string;
  type: string;
}

export async function improveWithAI({ current, type }: ImproveAIInput): Promise<string> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(session);

  const userId = session.user.id;

  const profile = await ProfileModel.findOne({ userId });

  if (!profile) throw new Error("User doesn't exist")

  if (!profile.industry) {
    revalidatePath("/onboarding");
    throw new Error("User has not chosen an industry yet")
  }

  const prompt = `
  As an expert resume writer, improve the following ${type} description for a ${profile.industry} professional.
  Make it more impactful, quantifiable, and aligned with industry standards.

  Current content: "${current}"

  Requirements:
  1. Use action verbs
  2. Include metrics and results
  3. Highlight relevant skills
  4. Keep it concise but detailed
  5. Use industry-specific keywords
  6. Focus on achievements, not responsibilities

  Format as a single paragraph with no extra commentary.
`;

  try {
    const result = await model.generateContent(prompt);
    const improved = result.response.text().trim();
    return improved;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Faield to improve content");
  }
}

export async function generateAtsFeedback(userId: string, content: string) {
  await dbConnect();
  const resume = await ResumeModel.findOneAndUpdate(
    { userId },
    { content },
    { upsert: true, new: true }
  );

  const prompt = `
    You are an expert career coach and resume reviewer trained in Applicant Tracking Systems (ATS) and recruitment best practices.

    Analyze the following resume content for its effectiveness in passing ATS filters and impressing recruiters.

    Instructions:
    1. Provide a JSON response only.
    2. Your response must include:
      - "atsScore": A score from 0 to 100 evaluating how well this resume is, to get a job with the same match.
      - "feedback": An array of specific, actionable suggestions to improve the resume. Feedback should be concise and written in a professional tone.

    Do not include any commentary or text outside the JSON object.

    Resume Content:
    """
    ${content}
    """

    Return only this format: And give me only 3-4 critical suggestions
    {
      "atsScore": 0-100,
      "feedback": [
        "Suggestion 1",
        "Suggestion-2",
        ...
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  let rawText = result.response.text();

  rawText = rawText.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error("AI failed to return valid JSON:", err, "\nRaw text was:\n", rawText);
    throw new Error("Invalid AI response.");
  }

  const updated = await ResumeModel.findByIdAndUpdate(resume._id, {
    atsScore: parsed.atsScore,
    feedback: parsed.feedback,
    content,
  }, { new: true });

  return {
    atsScore: updated.atsScore,
    feedback: updated.feedback,
    resumeId: updated._id.toString(),
  };
}