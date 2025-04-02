import mongoose, { Schema, Document } from "mongoose";

interface IIndustryInsight extends Document {
  industry: string;
  salaryRanges: { role: string; min: number; max: number; median: number; location?: string }[];
  growthRate: number;
  demandLevel: "High" | "Medium" | "Low";
  topSkills: string[];
  marketOutlook: "Positive" | "Neutral" | "Negative";
  keyTrends: string[];
  recommendedSkills: string[];
}

const IndustryInsightSchema: Schema<IIndustryInsight> = new Schema(
  {
    industry: { type: String, required: true, unique: true },
    salaryRanges: [
      {
        role: String,
        min: Number,
        max: Number,
        median: Number,
        location: String,
      },
    ],
    growthRate: { 
        type: Number, 
        required: true 
    },
    demandLevel: { 
        type: String, 
        required: true ,
        enum: ["High", "Medium", "Low"]
    },
    topSkills: [
        { 
            type: String, 
            required: true 
        }
    ],
    marketOutlook: { 
        type: String, 
        required: true ,
        enum: ["Positive", "Neutral", "Negative"]
    },
    keyTrends: [
        { 
            type: String, 
            required: true 
        }
    ],
    recommendedSkills: [
        { 
            type: String, 
            required: true 
        }
    ],
  },
  { timestamps: true }
);

const IndustryInsightModel = mongoose.models.IndustryInsight || mongoose.model<IIndustryInsight>("IndustryInsight", IndustryInsightSchema);

export default IndustryInsightModel;
