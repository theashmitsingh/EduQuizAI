import express from 'express'
import userAuth from '../middlewares/userAuth.js';
import { getUserData } from '../controllers/UserController.js';

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);

export default userRouter;