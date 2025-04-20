import mongoose from "mongoose";

const previousSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        question: {
          type: String,
          required: true,
        },
        selectedOptions: {
          type: [String],
          required: true,
        },
        correctAnswers: {
          type: [String],
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PreviousQuiz = mongoose.model("PreviousQuiz", previousSchema);

export default PreviousQuiz;
