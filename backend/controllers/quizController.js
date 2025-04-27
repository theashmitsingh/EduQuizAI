import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import Quiz from '../models/quizModel.js';
import User from '../models/userModel.js';
import { extractTextFromPDF } from '../utils/pdfUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Upload PDF and generate quiz
export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!req.body.userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const pdfPath = req.file.path;
    const pdfContent = await extractTextFromPDF(pdfPath);

    if (!pdfContent) {
      return res.status(400).json({ success: false, message: "Could not extract text from PDF" });
    }

    // Generate quiz using Mistral API
    const prompt = `Generate a quiz based on the following content. Create 10 multiple choice questions with 4 options each. Format the response as a JSON array with each question having: question (string), options (array of 4 strings), and answer (string matching one of the options). Content: ${pdfContent.substring(0, 4000)}`;

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: "mistral-tiny",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        }
      }
    );

    const quizContent = response.data.choices[0].message.content;
    let quizData;

    try {
      // Extract JSON from the response
      const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      console.error("Error parsing quiz data:", error);
      return res.status(500).json({ success: false, message: "Failed to parse quiz data" });
    }

    // Validate quiz structure
    if (!Array.isArray(quizData) || quizData.length === 0) {
      return res.status(500).json({ success: false, message: "Invalid quiz format" });
    }

    // Create new quiz
    const newQuiz = new Quiz({
      title: `Quiz from PDF: ${req.file.originalname.substring(0, 50)}`,
      questions: quizData,
      userId: req.body.userId
    });

    await newQuiz.save();

    // Update user's quiz list
    await User.findByIdAndUpdate(
      req.body.userId,
      { $push: { userQuiz: newQuiz._id } }
    );

    // Clean up the uploaded file
    fs.unlinkSync(pdfPath);

    res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: quizData,
      quizId: newQuiz._id
    });

  } catch (error) {
    console.error("Error in uploadPDF:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate quiz from content
export const generateQuiz = async (req, res) => {
  try {
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({ success: false, message: "Content and userId are required" });
    }

    // Generate quiz using Mistral API
    const prompt = `Generate a quiz based on the following content. Create 10 multiple choice questions with 4 options each. Format the response as a JSON array with each question having: question (string), options (array of 4 strings), and answer (string matching one of the options). Content: ${content.substring(0, 4000)}`;

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: "mistral-tiny",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        }
      }
    );

    const quizContent = response.data.choices[0].message.content;
    let quizData;

    try {
      // Extract JSON from the response
      const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      console.error("Error parsing quiz data:", error);
      return res.status(500).json({ success: false, message: "Failed to parse quiz data" });
    }

    // Validate quiz structure
    if (!Array.isArray(quizData) || quizData.length === 0) {
      return res.status(500).json({ success: false, message: "Invalid quiz format" });
    }

    // Create new quiz
    const newQuiz = new Quiz({
      title: `Quiz: ${content.substring(0, 50)}`,
      questions: quizData,
      userId
    });

    await newQuiz.save();

    // Update user's quiz list
    await User.findByIdAndUpdate(
      userId,
      { $push: { userQuiz: newQuiz._id } }
    );

    res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: quizData,
      quizId: newQuiz._id
    });

  } catch (error) {
    console.error("Error in generateQuiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    if (!quizId) {
      return res.status(400).json({ success: false, message: "Quiz ID is required" });
    }

    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error("Error in getQuizById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all quizzes for a user
export const getUserQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId).populate('userQuiz');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      quizzes: user.userQuiz
    });
  } catch (error) {
    console.error("Error in getUserQuizzes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz answers
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, score, userId } = req.body;

    if (!quizId || !answers || score === undefined || !userId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Update quiz with submission
    quiz.submissions = quiz.submissions || [];
    quiz.submissions.push({
      userId,
      answers,
      score,
      submittedAt: new Date()
    });

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score
    });
  } catch (error) {
    console.error("Error in submitQuiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 