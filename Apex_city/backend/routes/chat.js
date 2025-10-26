import express from "express";
import { getChatbotResponse } from "../services/rag/rag_services.js";

const router = express.Router();

// POST /chat  → frontend sends user's query here
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    console.log(` User: ${message}`);

    const reply = await getChatbotResponse(message);

    console.log(` Bot: ${reply}`);
    res.json({ reply });
  } catch (err) {
    console.error(" Chat route error:", err);
    res.status(500).json({ reply: "Internal server error." });
  }
});

export default router;
