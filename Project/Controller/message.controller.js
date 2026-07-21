import { Conversation } from "../Models/conversation.model.js";
import { Message } from "../Models/message.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
import cloudinary from "cloudinary";

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imgUrl = "";

        // If an image file is included, upload it to Cloudinary just like you do for posts
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            
            const cloudinaryResult = await cloudinary.uploader.upload(dataURI, {
                folder: "jsocial/chats"
            });
            imgUrl = cloudinaryResult.secure_url;
        }

        // Validate that they aren't sending an entirely empty message
        if (!text && !imgUrl) {
            return res.status(400).json({ success: false, message: "Please provide text or an image." });
        }

        // Check if a conversation already exists between these two users
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        // If not, create a new one
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Create the new message
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            imgUrl
        });

        // Add the message to the conversation array
        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        // Save both simultaneously for better performance
        await Promise.all([conversation.save(), newMessage.save()]);

        // --- REAL-TIME SOCKET EMISSION ---
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            // io.to().emit() sends an event to ONLY that specific user
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({ success: true, message: newMessage });

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        // Find the conversation and automatically populate the actual message documents
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages"); // NOT referencing the ID, but the actual message object

        if (!conversation) {
            // If they haven't chatted yet, return an empty array
            return res.status(200).json({ success: true, messages: [] });
        }

        return res.status(200).json({ success: true, messages: conversation.messages });

    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all conversations where this user is a participant
        const conversations = await Conversation.find({
            participants: userId
        })
        .populate({
            path: "participants",
            select: "fullname username profileImg"
        })
        .populate({
            path: "messages",
            options: { sort: { createdAt: -1 }, limit: 1 } // Grab only the latest message
        })
        .sort({ updatedAt: -1 }); // Sort by most recently active

        // Format data to make it easy for the frontend to render
        const formattedConversations = conversations.map(conv => {
            // Filter out the logged-in user so we only send the *other* user's details
            const otherUser = conv.participants.find(p => p._id.toString() !== userId.toString());
            return {
                _id: conv._id,
                otherUser,
                lastMessage: conv.messages[0] || null,
                updatedAt: conv.updatedAt
            };
        });

        return res.status(200).json({ success: true, conversations: formattedConversations });

    } catch (error) {
        console.log("Error in getConversations:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
