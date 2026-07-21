import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    imgUrl: { type: String, default: "" },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null } 
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);