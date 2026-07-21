import { Server } from "socket.io";
import http from "http";
import express from "express";
import { Message } from "../Models/message.model.js";
import dotenv from "dotenv"; 

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
});

// The "Phonebook": { "userId": "socketId" }
const userSocketMap = {}; 

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Emit online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // --- 💬 CHAT REAL-TIME EVENTS ---

    // 1. Live Typing Indicator
    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", { senderId: userId });
        }
    });

    // 2. Stop Typing Indicator
    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
        }
    });

    // 3. Mark Message as Read (Blue Ticks)
    socket.on("markAsRead", async ({ messageId, senderId }) => {
        try {
            await Message.findByIdAndUpdate(messageId, { status: "read" });

            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageRead", { messageId });
            }
        } catch (error) {
            console.error("Error marking message as read in socket:", error);
        }
    });

    // --- DISCONNECT ---
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (userId && userId !== "undefined") {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };