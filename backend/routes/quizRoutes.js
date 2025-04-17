import express from "express";
import multer from "multer";
import quizController from "../controllers/QuizController.cjs"; // ✅ Use default import
import userAuth from "../middlewares/userAuth";

const { generateQuiz, uploadPDF, generateQuizFromContent } = quizController; // ✅ Extract functions correctly

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("pdfFile"), uploadPDF);
router.post("/generate-quiz", userAuth, generateQuiz);
router.post("/generate-quiz-content", generateQuizFromContent);

export default router; // ✅ Keep it as ES module
