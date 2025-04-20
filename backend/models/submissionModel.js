import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [
        {
            question: { type: String, required: true },
            selectedOptions: [{ type: String, required: true }],
            correctAnswers: [{ type: String, required: true }],
            isCorrect: { type: Boolean, required: true },
        }
    ],
    score: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
});

const submissionModel = mongoose.model("Submission", submissionSchema);
export default submissionModel;
