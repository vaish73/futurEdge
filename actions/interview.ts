"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ProfileModel, { Profile } from "@/models/Profile";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import AssessmentModel from "@/models/Assessment";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuiz() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log("SESSION:", session);

  const userId = session.user.id;
  const profile = (await ProfileModel.findOne({
    userId,
  }).lean()) as Profile | null;

  const prompt = `
    Generate 10 technical interview questions for a 
    ${profile?.industry} professional
    ${profile?.skills?.length ? ` with expertise in ${profile.skills.join(", ")}` : ""}.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;
  try {
    await dbConnect();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);
    return quiz.questions;
  } catch (error) {
    console.error("Error generating Quiz:", error);
    throw new Error("Failed to generate Quiz");
  }
}

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export async function saveQuizResult(questions: Question[], answers: string[], score: number) {
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

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation
  }));

  let improvementTip: string | null = null;
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  if (wrongAnswers.length > 0) {
    const wrongText = wrongAnswers.map(
      (q) =>
        `Question: "${q.question}"\nCorrect: "${q.answer}"\nUser: "${q.userAnswer}"`
    )
      .join("\n\n");

    const tipPrompt =
      `The user got the following ${profile?.industry} technical interview questions wrong:

        ${wrongText}

        Based on these mistakes, provide a concise, specific improvement tip.
        Focus on knowledge gaps. Keep it under 2 sentences and encouraging.
        Don't explicitly mention the mistakes, instead focus on what to learn/practice`;
    try {
      const tipResult = await model.generateContent(tipPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("Gemini tip error:", error);

    }
  }
  try {
    const assessment = await AssessmentModel.create({
      userId,
      quizScore: score,
      questions: questionResults,
      category: "Technical",
      improvementTip,
    })

    // Convert Mongoose document to plain object
    const plainAssessment = assessment.toObject();
    
    // Optionally convert ObjectId to string if needed
    plainAssessment._id = plainAssessment._id.toString();
    plainAssessment.userId = plainAssessment.userId.toString();
    
    // Convert any nested ObjectIds in questions array
    if (plainAssessment.questions) {
      plainAssessment.questions = plainAssessment.questions.map((q: { _id: { toString: () => any; }; }) => ({
        ...q,
        _id: q._id?.toString() // If questions have their own _id
      }));
    }

    return plainAssessment;
    
  } catch (error) {
    console.error("Error while saving quiz result", error);

  }

}

type Assessment = {
  _id: string;
  quizScore: number;
  category: string;
  createdAt: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean;
    _id: string;
  }[];
  improvementTip: string;
};


export async function getAssessments(): Promise<Assessment[]> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const rawDocs = await AssessmentModel
    .find({ userId: session.user.id })
    .lean<{
      questions: {
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
        _id?: any;
        answer: string;
        userAnswer: string;
        isCorrect: boolean;
      }[]; _id: any; quizScore: number; category: string; createdAt: Date; improvementTip: string
}[]>(); 

  const assessments: Assessment[] = rawDocs.map((doc) => ({
    _id: doc._id.toString(),
    quizScore: Number(doc.quizScore),
    category: doc.category,
    createdAt: doc.createdAt.toISOString(),
    questions: doc.questions.map((q) => ({
      ...q,
      _id: q._id?.toString?.() ?? undefined,
      answer: q.answer,               
      userAnswer: q.userAnswer,      
      isCorrect: q.isCorrect,   
    })),
    improvementTip: doc.improvementTip
  }));

  return assessments;
}
