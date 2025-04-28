import mongoose from "mongoose";

const previousSchema = new mongoose.Schema(
  {
    user: {
      type: String,  // Keep as String (no ref)
      required: true,
    },
    quiz: {
      type: String,  // Keep as String (no ref)
      required: true,
    },
    answers: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
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
