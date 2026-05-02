import jwt from "jsonwebtoken";
import db from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //fetch user from DB
    const [user] = await db
      .promise()
      .query("SELECT id, fullName, email, bio,profilePic FROM users WHERE id = ?", [decoded.userId]);

    if (user.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    // attach full user
    req.user = user[0];

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};