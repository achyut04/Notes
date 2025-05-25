const express = require("express");
const router = express.Router();
const { chatCompletion } = require("../utils/chatCompletion");
const { prisma } = require("../utils/db");
const authenticate = require("../middleware/authMiddleware");

router.post("/summarize/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or Note not found" });
    }

    const response = await chatCompletion({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        { role: "user", content: `Summarize this note:\n\n${note.content}` },
      ],
    });

    const summary = response.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing note:", error);
    res.status(500).json({ error: "Failed to summarize note" });
  }
});

router.post("/notes", authenticate, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.userId;

  try {
    const note = await prisma.note.create({
      data: { title, content, userId },
    });
    res.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.get("/notes", authenticate, async (req, res) => {
  const userId = req.user.userId;

  try {
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

router.delete("/notes/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.note.delete({ where: { id } });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

router.put("/notes/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.userId;

  try {
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content },
    });

    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

module.exports = router;
