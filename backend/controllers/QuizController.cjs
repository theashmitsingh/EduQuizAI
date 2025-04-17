const axios = require("axios");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const quizModel = require("../models/quizModel");

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
  console.log()
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
      // check json
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
      // console.log(quizJSON);
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
  const userId = req.user.id;
  if (!content) {
      return res.status(400).json({
          success: false,
          message: "Content is required"
      });
  }

  try {
      // console.log("MISTRAL_URL:", MISTRAL_URL);
      // console.log("MISTRAL_API_KEY:", MISTRAL_API_KEY);

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
                  "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                  "Content-Type": "application/json",
              },
          }
      );

      // console.log("API Response:", response.data);

      if (!response.data.choices || !response.data.choices.length) {
          throw new Error("Invalid API response format");
      }

      const quizText = response.data.choices[0].message.content.trim();
      // console.log("Raw Quiz JSON:", quizText);

      let quizJSON;
      try {
          quizJSON = JSON.parse(quizText);
          if (!Array.isArray(quizJSON) || !quizJSON.every(q => q.question && q.options && q.answer)) {
              throw new Error("Invalid quiz format");
          }
      } catch (error) {
          console.error("Invalid JSON from API:", quizText);
          return res.status(500).json({
              success: false,
              message: "Error parsing quiz JSON"
          });
      }

      const newQuiz = new quizModel({
        title: `Quiz on ${content}`,
        content,
        questions: quizJSON,
        createdBy: userId,
      });

      await newQuiz.save();
      
      return res.status(200).json({
          success: true,
          message: "Quiz generated successfully",
          quiz: quizJSON
      });

  } catch (error) {
      console.error("Error generating quiz:", error);
      return res.status(500).json({
          success: false,
          message: "Internal Server Error"
      });
  }
};

exports.generateQuizFromContent = async (content) => {
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

  return JSON.parse(response.data.choices[0].message.content.trim());
};
