import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}


  if (!token) {
    return res.status(401).json({ error: "Acces Denied. No token found." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
