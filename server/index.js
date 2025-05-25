const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const authRoutes = require("./routes/auth");

const app = express();

const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", routes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
