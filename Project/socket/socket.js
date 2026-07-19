import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // 👇 Add the fallback to localhost:5173 just in case the .env is missing!
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
});

// The "Phonebook": Keeps track of which user is holding which socket connection
const userSocketMap = {}; // Format: { "userId": "socketId" }

// Helper function we can import into controllers to find a user's socket ID
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // When the React frontend connects, it will pass the logged-in user's ID
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Optional: Emit to everyone who is currently online (Super useful for Chat later!)
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // When the user closes the tab or logs out
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (userId && userId !== "undefined") {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };