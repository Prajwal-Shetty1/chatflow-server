import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import db from "./lib/db.js";
import userRoutes from "./routes/userRoutes.js";
import messsageRouter from "./routes/messageRoutes.js";

// app config
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/api/status", (req, res) => {
  res.send("API Working 🚀");
});

//userRoutes setup
app.use("/api/users", userRoutes);

//messageRoutes setup
app.use("/api/messages", messsageRouter);

// start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});