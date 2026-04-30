import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import db from "./lib/db.js";
import userRoutes from "./routes/userRoutes.js";
import messsageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// app config
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

//Initialize socket.io server
export const io = new Server(server,{
  cors: {origin: "*"}
})

//Store online Users
export const userSocketmap = {};  //{userId: socketId}

//Socket.io connection handler
io.on("connection",(socket)=> {
  const userId = socket.handshake.query.userId;
  console.log("User Connected",userId);
  if(userId) userSocketmap[userId] = socket.id;

  //Emit online users to all connected clients
  io.emit("getOnlineUsers",Object.keys(userSocketmap));
  socket.on("disconnect", () => {
  if (userId) {
    console.log("User Disconnected",userId);
    delete userSocketmap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketmap));
  }
});
})
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