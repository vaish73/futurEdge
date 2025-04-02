import mongoose, { Schema, Document } from "mongoose";

interface ICoverLetter extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    content: string;
    jobDescription?: string;
    companyName: string;
    jobTitle: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const CoverLetterSchema: Schema<ICoverLetter> = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true
        },
        content: { 
            type: String, 
            required: true 
        },
        jobDescription: { 
            type: String 
        },
        companyName: { 
            type: String, 
            required: true 
        },
        jobTitle: { 
            type: String, 
            required: true 
        },
        status: { 
            type: String, 
            default: "draft" 
        },
    },
    { timestamps: true }
);

const CoverLetterModel = mongoose.models.CoverLetter || mongoose.model<ICoverLetter>("CoverLetter", CoverLetterSchema);
export default CoverLetterModel;
