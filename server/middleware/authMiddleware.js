const { verifyToken } = require("../utils/auth");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
};

module.exports = authenticate;
