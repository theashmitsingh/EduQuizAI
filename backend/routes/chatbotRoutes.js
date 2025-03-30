import express from 'express';
import { chatBot } from '../controllers/ChatBotController.js';

const router = express.Router();

router.post("/chat", chatBot);

export default router;
