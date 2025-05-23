const express = require("express");
const router = express.Router();
const openai = require("../utils/openai");
const { prisma } = require("../utils/db");

router.post("/summarize", async (req, res) => {
  const { content } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "user", content: `Summarize this note:\n\n${content}` },
      ],
    });
    res.json({ summary: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/notes", async (req, res) => {
  const { title, content, userId } = req.body;

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

router.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const note = await prisma.note.update({
      where: { id: parseInt(id) },
      data: { title, content },
    });
    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.note.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

router.get("/notes", async (req, res) => {
  const { userId } = req.query;

  try {
    const notes = await prisma.note.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});


router.get("/notes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const note = await prisma.note.findUnique({
      where: { id: parseInt(id) },
    });
    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});



module.exports = router;