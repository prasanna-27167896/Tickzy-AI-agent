import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env before anything else
dotenv.config();

const db = async () => {
  try {
    console.log("MONGO_URI =", process.env.MONGO_URI); // Debugging line
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully...");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
};

export default db;
