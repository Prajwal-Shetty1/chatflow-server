import db from "../lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= REGISTER(Signup) ================= */
export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, bio } = req.body;

        // validation
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ message: "All fields are required" });
        }

        email = email.trim().toLowerCase();


        // check if user exists
        const [existingUser] = await db
            .promise()
            .query("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // insert user
        await db
            .promise()
            .query(
                "INSERT INTO users (fullName, email, password, bio) VALUES (?, ?, ?, ?)",
                [fullName, email, hashedPassword, bio]
            );

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};