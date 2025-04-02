import mongoose, {Schema, Document} from "mongoose";

interface IResume extends Document{
    id: mongoose.Schema.Types.ObjectId;
    content: string;
    atsScore: number;
    feedback: string;
}

const ResumeSchema: Schema<IResume> = new mongoose.Schema({
    id: {
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
