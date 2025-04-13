import mongoose, {Schema, Document} from "mongoose";
import { InferSchemaType } from "mongoose";

export interface IAssessment extends Document{
    userId: mongoose.Schema.Types.ObjectId,
    quizScore: number;
    questions: { question: string, answer: string, userAnswer: string, isCorrect: boolean, explanation: string },
    category: string;
    improvementTip?: string;
}

export const AssessmentSchema: Schema<IAssessment> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    quizScore: {
        type: Number,
        required: true,
        default: 0
    },
    questions: [
        {
            question: String,
            answer: String,
            userAnswer: String,
            isCorrect: Boolean,
            explanation:{type: String}
        }
    ],
    category: {
        type: String,
        required: true
    },
    improvementTip: {
        type: String
    }
},{timestamps: true})

export type AssessmentLean = InferSchemaType<typeof AssessmentSchema> & {
    _id: string;
    createdAt: string;
};

const AssessmentModel = mongoose.models.Assessment || mongoose.model<IAssessment>("Assessment", AssessmentSchema)

export default AssessmentModel;
