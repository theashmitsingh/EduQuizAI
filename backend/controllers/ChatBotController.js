import axios from 'axios';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

export const chatBot = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message cannot be empty!" });
    }

    try {
        const prompt = `Answer the following question as an AI: ${message}`;

        // Sending request to Mistral AI API
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

        // Extract AI-generated response
        const aiReply = response.data.choices[0].message.content.trim();
        console.log(aiReply);

        // Send response back to frontend
        res.json({ reply: aiReply });

    } catch (error) {
        console.error("Error fetching chatbot response:", error);
        res.status(500).json({ error: "Failed to get response from AI" });
    }
};
