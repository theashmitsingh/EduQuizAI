import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(401).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        const hashPassword = await argon2.hash(password);
        const user = new userModel({ name, email, password: hashPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        try {
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: 'Welcome to GreatStack',
                html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
            };
        
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.response);
        } catch (error) {
            console.error("Error sending email:", error);
        }
        

        return res.status(200).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        console.log("Something went wrong at register route: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "User loggedin successfully"
        });
    } catch (error) {
        console.log("Something went wrong at login route: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        console.log("Something went wrong at logout: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Verification OTP send successfully"
        })
    } catch (error) {
        console.log("Something went wrong at verify OTP: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if(!userId || !otp) {
        return res.status(401).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User does not exist!"
            });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.status(401).json({
                success: false,
                message: "OTP is invalid"
            });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "OTP is exipred"
            });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email is verified successfully"
        });
    } catch (error) {
        console.log("Something went wrong at verify email controller: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User is authenticated"
        });
    } catch (error) {
        console.log("Something went wrong at authenticated controller: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found!"
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP for reset your password is ${otp}. Use this otp to proceed with resetting your password`
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Password reset OTP has been sent successfully"
        });
    } catch (error) {
        console.log("Something went wrong at send reset otp controller: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if(!email || !otp || !newPassword) {
        return res.status(401).json({
            success: false,
            message: "Email, OTP and New Password are required"
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.status(403).json({
                success: false,
                message: "Invalid or missing OTP"
            });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "OTP has been expired"
            });
        }

        const hashPassword = await argon2.hash(newPassword);
        user.password = hashPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.log("Something went wrong at reset password controller: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

}