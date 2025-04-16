import mongoose, {Schema, Document} from "mongoose";

export interface IResume extends Document{
    userId: mongoose.Schema.Types.ObjectId;
    content: string;
    atsScore: number;
    feedback: string;
    createdAt: Date;
    updatedAt: Date;
}

const ResumeSchema: Schema<IResume> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    atsScore: {
        type: Number,
        required: true
    },
    feedback: {
        type: String,
        required: true
    }
}, {timestamps: true})

const ResumeModel = mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema)

export default ResumeModel;
