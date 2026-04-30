import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controller/messageController.js";


const messsageRouter = express.Router();

messsageRouter.get("/users",protectRoute,getUsersForSidebar);

messsageRouter.get("/:id",protectRoute,getMessages);

messageRouter.post("/send/:id",protectRoute, upload.single("image"),sendMessage);

export default messsageRouter;