import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";

// app config
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

// start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});