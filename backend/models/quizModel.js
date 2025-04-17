import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answers: [{ type: String, required: true }],
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true },
    createdAt: { type: Date, default: Date.now },
});

const quizModel = mongoose.model("Quiz", quizSchema);
export default quizModel;
