import IndustryInsightModel, { IIndustryInsight } from "@/models/IndustryInsights";
import { inngest } from "./client";
import { GenerateContentResponse, GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

type Industry = Pick<IIndustryInsight, "industry">;

export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
  },
  {
    cron: "0 0 * * 0",
  },
  async ({ step }) => {
    const industries = await step.run("Fetch Industries", async (): Promise<Industry[]> => {
      const results = await IndustryInsightModel.find({}, { industry: 1, _id: 0 }).lean().exec();
      return results as unknown as Industry[];
    });

    console.log("Fetched Industries:", industries);

    for (const { industry } of industries) {
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

      const result = await step.ai.wrap("gemini", async (prompt: string) => {
        return await model.generateContent(prompt);
      }, prompt) as GenerateContentResponse;

      const contentResponse =  result; // ✅ this works now

      if (!contentResponse?.candidates?.length) {
        throw new Error(`Gemini failed to generate content for ${industry}`);
      }

      const text = contentResponse.candidates[0]?.content.parts?.[0]?.text ?? "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      const insights = JSON.parse(cleanedText);

      await step.run(`Update ${industry} insights`, async () => {
        await IndustryInsightModel.findOneAndUpdate(
          { industry },
          {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          { upsert: true, new: true }
        );
      });
    }
  }
);
