import db from "../lib/db.js";
import { io, userSocketmap } from "../server.js";
// Get users for left sidebar (with unseen count-no of unread messages for each users)

export const getUsersForSidebar = async (req, res) => {
    try {

        const userId = req.user.id;
        const [users] = await db.promise().query(
            `SELECT 
        u.id,
        u.fullName,
        u.email,
        u.profilePic,
        COUNT(m.id) AS unseenCount
      FROM users u
      LEFT JOIN messages m
        ON u.id = m.senderId 
        AND m.receiverId = ? 
        AND m.seen = false
      WHERE u.id != ?
      GROUP BY u.id`,
            [userId, userId]
        );

        res.json({ success: true, users });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

// Get all messages between logged-in user and selected user

export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;  //logged-in user
        const { id: otherUserId } = req.params; //selected user

        // Mark messages as seen
        await db
            .promise()
            .query(
                `
        UPDATE messages 
        SET seen = true
        WHERE senderId = ? AND receiverId = ? AND seen = false
        `, [otherUserId, userId]
            )
        //Get all messages
        const [messages] = await db
            .promise()
            .query(
                `
        SELECT * FROM messages
        WHERE 
        (senderId = ? AND receiverId = ?)
        OR
        (senderId = ? AND receiverId = ?)
        ORDER BY createdAT ASC
        `, [userId, otherUserId, otherUserId, userId]
            )
        res.json({ success: true, messages });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}


//Send Messages to the selected users

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { id: receiverId } = req.params;
        const { text } = req.body;

        let imageUrl = null;

        //if image exists
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }
        //insert message
        const [result] = await
            db.promise()
                .query(`
            INSERT INTO messages(senderId,receiverId,text,image,seen)
            VALUES (?,?,?,?,?,false),
            [senderId,receiverId,text || null,imageUrl]
            `);
        //Emit the new message to the receivers socket
        const receiverSocketId = userSocketmap[receiverId];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({
            success: true,
            message: {
                id: result.insertId,
                senderId,
                receiverId,
                text, image: imageUrl,
                seen: false
            },
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}
