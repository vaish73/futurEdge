"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ProfileModel, { Profile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import IndustryInsightModel from "@/models/IndustryInsights";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface SalaryRange {
  role: string;
  min: number;
  max: number;
  median: number;
  location: string;
}

interface IndustryInsight {
  salaryRanges: SalaryRange[];
  growthRate: number;
  demandLevel: "High" | "Medium" | "Low";
  topSkills: string[];
  marketOutlook: "Positive" | "Neutral" | "Negative";
  keyTrends: string[];
  recommendedSkills: string[];
  industry: string;
  updatedAt: string;
  nextUpdate: string;
}

export async function generateAIInsights(industry: string): Promise<Omit<IndustryInsight, 'industry' | 'lastUpdated' | 'nextUpdate'>> {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["string"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["string"],
      "recommendedSkills": ["string"]
    }
    Rules:
    1. Return ONLY the JSON
    2. Include 5 common roles
    3. Growth rate as percentage
    4. Include 5 skills and trends
  `;

  try {
    await dbConnect();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI generation failed:", error);
    throw new Error("Failed to generate insights");
  }
}

export async function getIndustryInsights(): Promise<IndustryInsight> {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const profile = await ProfileModel.findOne({ userId }).lean() as Profile | null;
  
  if (!profile?.industry) {
    throw new Error("No industry selected");
  }

  // Check for valid cached insights
  const existingInsight = await IndustryInsightModel.findOne({
    userId,
    nextUpdate: { $gt: new Date() }
  }).lean() as IndustryInsight | null;

  if (existingInsight) {
    return {
      salaryRanges: existingInsight.salaryRanges,
      growthRate: existingInsight.growthRate,
      demandLevel: existingInsight.demandLevel,
      topSkills: existingInsight.topSkills,
      marketOutlook: existingInsight.marketOutlook,
      keyTrends: existingInsight.keyTrends,
      recommendedSkills: existingInsight.recommendedSkills,
      industry: existingInsight.industry,
      updatedAt: existingInsight.updatedAt.toString(),
      nextUpdate: existingInsight.nextUpdate.toString()
    };
  }

  // Generate new insights
  const insightsData = await generateAIInsights(profile.industry);

  // Update or create new insights
  const newInsight = await IndustryInsightModel.findOneAndUpdate(
    { userId },
    {
      ...insightsData,
      industry: profile.industry,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week cache
    },
    { upsert: true, new: true }
  ).lean() as IndustryInsight | null;

  if (!newInsight) {
    throw new Error("Failed to create insights");
  }

  return {
    salaryRanges: newInsight.salaryRanges,
    growthRate: newInsight.growthRate,
    demandLevel: newInsight.demandLevel,
    topSkills: newInsight.topSkills,
    marketOutlook: newInsight.marketOutlook,
    keyTrends: newInsight.keyTrends,
    recommendedSkills: newInsight.recommendedSkills,
    industry: newInsight.industry,
    updatedAt: newInsight.updatedAt.toString(),
    nextUpdate: newInsight.nextUpdate.toString()
  };
}