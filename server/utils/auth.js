const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET_KEY = process.env.JWT_SECRET;

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePasswords = async (plain, hash) => bcrypt.compare(plain, hash);
const generateToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

const verifyToken = (token) => jwt.verify(token, SECRET_KEY);

module.exports = {
  hashPassword,
  comparePasswords,
  generateToken,
  verifyToken,
};
