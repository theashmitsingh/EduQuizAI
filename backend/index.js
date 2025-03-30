import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import connectDB from './config/database.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import chatbotRouter from './routes/chatbotRoutes.js'
import quizRouter from './routes/quizRoutes.js'

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

const allowedOrigin = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigin, credentials: true, methods: "GET, POST"}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use("/api/chatbot", chatbotRouter);
app.use('/api/quiz', quizRouter)

app.get("/", (req, res) => {
    console.log("Everything is working fine!");
    res.send("API is working fine");
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});