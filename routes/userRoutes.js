import express from "express";
import { checkAuth, loginUser, registerUser } from "../controller/userController.js";
import { protectRoute } from "../middleware/auth.js";
import {upload} from "../middleware/upload.js";

const userRouter = express.Router();

//Auth routes
userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);

//Check auth (token verify)
userRouter.get("/check",protectRoute,checkAuth);

//Update profile (with image)
router.put("/update-profile",protect,upload.single("image"),updateProfile);
