import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("MongoDB is Connected Successfully!");
    }).catch((error) => {
        console.log("Error connecting to MongoDB: ", error);
    });
}

export default connectDB;