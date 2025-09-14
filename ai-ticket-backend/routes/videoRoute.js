import express from "express";
import { invite } from "../controllers/videoController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
router.post("/room/:id", invite);

export default router;
