import jwt from 'jsonwebtoken';
import 'dotenv/config';
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "You're not authorized"
        });
    }

    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY);

        if (decode.id) {
            req.body.userId = decode.id;
        } else {
            return res.status(401).json({
                success: false,
                message: "You're not authorized"
            });
        }
        next();
    } catch (error) {
        console.log("Something went wrong at middleware authToken: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export default userAuth;