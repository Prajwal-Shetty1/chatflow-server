import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controller/messageController.js";
import upload from "../middleware/upload.js";

const messageRouter = express.Router();

messageRouter.get("/users",protectRoute,getUsersForSidebar);

messageRouter.get("/:id",protectRoute,getMessages);

messageRouter.post("/send/:id",protectRoute, upload.single("image"),sendMessage);

export default messageRouter;