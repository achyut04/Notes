const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const authRoutes = require("./routes/auth");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://notes-xi-gray-16.vercel.app",
];

const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: function (origin, callback) {
    if(!origin) return callback(null, true);
    if(allowedOrigins.includes(origin)) {
      callback(null, true);
    }
    else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
