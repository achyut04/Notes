const express = require("express");
const router = express.Router();
const { prisma } = require("../utils/db");
const {
  hashPassword,
  comparePasswords,
  generateToken,
} = require("../utils/auth");

router.post("/register", async (req, res) => {
  const {name, email, password } = req.body;

  try {
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
