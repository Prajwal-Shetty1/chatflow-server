import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, sendMessage, saveCallLog } from "../controller/messageController.js";
import upload from "../middleware/upload.js";

const messageRouter = express.Router();

messageRouter.get("/users",protectRoute,getUsersForSidebar);

messageRouter.get("/:id",protectRoute,getMessages);

messageRouter.post("/send/:id",protectRoute, upload.single("image"),sendMessage);

messageRouter.post("/call-log/:id", protectRoute,saveCallLog);

export default messageRouter;