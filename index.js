const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const rt = require("./routes/pasteroute");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();


app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pastebin-frontend-bice.vercel.app" // future frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use("/api", rt); 

app.get("/", (req, res) => {
  res.json({ message: "Pastebin backend running" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
