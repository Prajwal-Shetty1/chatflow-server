import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar } from "../controller/messageController.js";


const messsageRouter = express.Router();

messsageRouter.get("/users",protectRoute,getUsersForSidebar);

messsageRouter.get("/:id",protectRoute,getMessages);

export default messsageRouter;