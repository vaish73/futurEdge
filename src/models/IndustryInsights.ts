import mongoose, { Schema, Document } from "mongoose";

export interface IIndustryInsight extends Document {
  userId: mongoose.Types.ObjectId;
  industry: string;
  salaryRanges: { role: string; min: number; max: number; median: number; location?: string }[];
  growthRate: number;
  demandLevel: "High" | "Medium" | "Low";
  topSkills: string[];
  marketOutlook: "Positive" | "Neutral" | "Negative";
  keyTrends: string[];
  recommendedSkills: string[];
  nextUpdate: Date;
}

const IndustryInsightSchema: Schema<IIndustryInsight> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    industry: { type: String, required: true },
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
    nextUpdate: {
      type: Date,
      default: Date.now()
    }
  },
  { timestamps: true }
);

const IndustryInsightModel = mongoose.models.IndustryInsight || mongoose.model<IIndustryInsight>("IndustryInsight", IndustryInsightSchema);

export default IndustryInsightModel;
