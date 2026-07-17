import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true,
    },
    like: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        default: []
    },
    comments: [commentSchema]
}, { timestamps: true })

export const Post = mongoose.model("Post", postSchema);
