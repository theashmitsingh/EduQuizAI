const axios = require("axios");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { default: userModel } = require("../models/userModel");
const { default: quizModel } = require("../models/quizModel");
const previousSubmission = require("../models/previousSubmission").default;
const { default: mongoose } = require("mongoose");
const submissionModel = require("../models/submissionModel").default;

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No File Uploaded",
      });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const content = pdfData.text;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Please enter content",
      });
    }

    try {
      const prompt = `Generate a quiz with 21 multiple-choice questions in JSON format. 
      Each question must have:
      - A "question" field with the question text.
      - An "options" field (array) with 4 answer choices.
      - An "answer" field with the correct option.
      
      Return ONLY a JSON array. Do NOT include any explanation, text, or markdown formatting.
      
      Content: ${content}`;

      const response = await axios.post(
        MISTRAL_URL,
        {
          model: "mistral-tiny",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const quizText = response.data.choices[0].message.content.trim();
      let quizJSON;

      try {
        quizJSON = JSON.parse(quizText);
        if (
          !Array.isArray(quizJSON) ||
          !quizJSON.every((q) => q.question && q.options && q.answer)
        ) {
          throw new Error("Invalid quiz format");
        }
      } catch (error) {
        console.error("Invalid JSON from API:", quizText);
        return res.status(400).json({
          success: false,
          message: "Quiz generation failed. Try again",
        });
      }
    } catch (error) {
      console.log("Error processing upload pdf file: ", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error("Error processing upload:", error.message);
    res.status(500).json({ error: "Error processing upload." });
  }
};

exports.generateQuiz = async (req, res) => {
  const content = req.body.content;
  const userId = req.body.userId;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: "Content is required",
    });
  }

  try {
    const prompt = `Generate a quiz with 21 multiple-choice questions in JSON format. 
      Each question must have:
      - A "question" field with the question text.
      - An "options" field (array) with 4 answer choices.
      - An "answer" field with the correct option.
      
      Return ONLY a JSON array. Do NOT include any explanation, text, or markdown formatting.
      
      Content: ${content}`;

    const response = await axios.post(
      MISTRAL_URL,
      {
        model: "mistral-tiny",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.choices || !response.data.choices.length) {
      throw new Error("Invalid API response format");
    }

    const quizText = response.data.choices[0].message.content.trim();
    let quizJSON;
    try {
      quizJSON = JSON.parse(quizText);
      if (
        !Array.isArray(quizJSON) ||
        !quizJSON.every((q) => q.question && q.options && q.answer)
      ) {
        throw new Error("Invalid quiz format");
      }
    } catch (error) {
      console.error("Invalid JSON from API:", quizText);
      return res.status(500).json({
        success: false,
        message: "Error parsing quiz JSON",
      });
    }

    const newQuiz = new quizModel({
      title: `Quiz on ${content}`,
      content,
      questions: quizJSON,
      createdBy: userId,
    });

    await newQuiz.save();

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.quizes.push(newQuiz._id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: quizJSON,
      quizId: newQuiz._id,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.generateQuizFromContent = async (content, userId) => {
  const prompt = `Generate a quiz with 21 multiple-choice questions in JSON format based on this content: ${content}`;

  const response = await axios.post(
    MISTRAL_URL,
    {
      model: "mistral-tiny",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const quizData = JSON.parse(response.data.choices[0].message.content.trim());

  // ✅ Save the quiz to DB
  const newQuiz = await quizModel.create({
    title: `Quiz on ${content}`,
    content,
    questions: quizData.questions,
    createdBy: userId,
  });

  // ✅ Return the full quiz including its ID
  return newQuiz;
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, score } = req.body;
    const userId = req.body.userId;

    const quiz = await quizModel.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const submissionData = answers.map((answer) => {
      const original = quiz.questions.find(
        (q) => q.question === answer.question
      );
      const correct = original?.answer || "";
      const isCorrect = answer.selectedOptions.includes(correct);

      return {
        question: answer.question,
        selectedOptions: answer.selectedOptions,
        correctAnswers: [correct],
        isCorrect,
      };
    });

    const newSubmission = await submissionModel.create({
      user: userId,
      quiz: quizId,
      answers: submissionData,
      score,
    });

    res.status(201).json({
      message: "Quiz submitted successfully!",
      submission: newSubmission,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
};

exports.previousQuiz = async (req, res) => {
  try {
    const { quizId, userId } = req.body;

    if (!quizId || !userId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "quizId and userId are required",
      });
    }

    console.log("userId:", userId);
    console.log("quizId:", quizId);

    const accessPreviousQuiz = await previousSubmission.findOne({
      user: new mongoose.Types.ObjectId(userId),
      quiz: new mongoose.Types.ObjectId(quizId),
    });

    console.log("User ID Type:", typeof userId, userId);
    console.log("Quiz ID Type:", typeof quizId, quizId);
    console.log("ObjectId(userId):", new mongoose.Types.ObjectId(userId));
    console.log("ObjectId(quizId):", new mongoose.Types.ObjectId(quizId));

    console.log("Access Previous Quiz Submission: ", accessPreviousQuiz);

    if (!accessPreviousQuiz) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "No previous quiz submission found for this user and quiz",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Previous quiz fetched successfully",
      data: accessPreviousQuiz,
    });
  } catch (error) {
    console.log("Something went wrong at previous quiz controller: ", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Internal Server Error",
    });
  }
};
