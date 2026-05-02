import db from "../lib/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from '../lib/cloudinary.js';
import fs from "fs";

/* ================= REGISTER(Signup) ================= */
export const registerUser = async (req, res) => {
    try {
        let { fullName, email, password, bio } = req.body;

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
        const [result] = await db
            .promise()
            .query(
                "INSERT INTO users (fullName, email, password, bio) VALUES (?, ?, ?, ?)",
                [fullName, email, hashedPassword, bio]
            );
        // create token
        const token = generateToken(result.insertId);


        res.json({
            success: true, token, user: {
                userId: result.insertId,
                fullName,
                email,
                bio
            }, message: "User registered successfully"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};


/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;
        // validation
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        email = email.trim().toLowerCase();

        // find user
        const [user] = await db
            .promise()
            .query("SELECT * FROM users WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // create token
        const token = generateToken(user[0].id);


        res.json({
            success: true, token, user: {
                userId: user[0].id,
                fullName: user[0].fullName,
                email: user[0].email,
                bio: user[0].bio,
            }, message: "Login successful"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}


//Contoller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

//Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    const userId = req.user.id;
    let profilePicUrl = null;

    // if image exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      profilePicUrl = result.secure_url;

      // ✅ delete local file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    // update DB
    if (profilePicUrl) {
      await db
        .promise()
        .query(
          "UPDATE users SET fullName = ?, bio = ?, profilePic = ? WHERE id = ?",
          [fullName, bio, profilePicUrl, userId]
        );
    } else {
      await db
        .promise()
        .query(
          "UPDATE users SET fullName = ?, bio = ? WHERE id = ?",
          [fullName, bio, userId]
        );
    }

    // get updated user
    const [user] = await db
      .promise()
      .query(
        "SELECT id, fullName, email, bio, profilePic FROM users WHERE id = ?",
        [userId]
      );

    res.json({ success: true, user: user[0] });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};