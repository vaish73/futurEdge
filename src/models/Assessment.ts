import mongoose, {Schema, Document} from "mongoose";

interface IAssessment extends Document{
    id: mongoose.Schema.Types.ObjectId,
    quizScore: number;
    questions: { question: string, answer: string, userAnswer: string, isCorrect: boolean },
    category: string;
    improvementTip?: string;
}

const AssessmentSchema: Schema<IAssessment> = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
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
            isCorrect: Boolean
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

const AssessmentModel = mongoose.models.Assessment || mongoose.model<IAssessment>("Assessment", AssessmentSchema)

export default AssessmentModel;
