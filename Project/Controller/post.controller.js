import { Post } from "../Models/post.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createPost = async (req, res) => {
    try {
        const { caption } = req.body;

        if (!caption) {
            return res.status(400).json({ success: false, message: "Caption is required." });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "An image file is required." });
        }

        const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

        const imgUrl = cloudinaryResult.secure_url;

        const newPost = await Post.create({
            caption,
            imgUrl,
            like: [],
            comments: []
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: newPost
        });

    } catch (error) {
        console.error("Error while creating the post:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const likePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const likesArray = post.like || [];
        const isLiked = likesArray.includes(userId.toString());

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            [
                {
                    $set: {
                        like: {
                            $cond: [
                                { $in: [userId, "$like"] },
                                { $setDifference: ["$like", [userId]] },
                                { $concatArrays: ["$like", [userId]] }
                            ]
                        }
                    }
                }
            ],
            {
                new: true,
                updatePipeline: true
            }
        );

        res.status(200).json({
            message: isLiked ? "Post unliked successfully" : "Post liked successfully",
            updatedPost
        });

    } catch (error) {
        console.error("Error while toggling post like:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getAllPost = async (req, res) => {
    try {
        const allPosts = await Post.find({})

        return res.status(200).json({ message: "All post returned", allPosts })
    } catch (error) {
        console.log("Error in getAllPost : ", error.message)
    }
}

export const commentPost = async (req, res) => {
    try {
        let { text } = req.body
        let postId = req.params.id
        let userId = req.user._id

        const post = await Post.findById(postId)

        if (!post) {
            return res.json({ message: "post not found" })
        }

        if (!text) {
            return res.json({ message: "text field is required" })
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, {
            comments: [
                { text, userId }
            ]
        }, { new: true })

        res.json({ message: "Comment added", updatedPost })

    } catch (error) {
        console.log("Error in comment", error.message)
    }
}
