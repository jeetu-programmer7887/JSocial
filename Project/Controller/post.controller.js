import { Notification } from "../Models/notification.model.js";
import { Post } from "../Models/post.model.js";
import { User } from "../Models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { io, getReceiverSocketId } from "../socket/socket.js"; 

export const createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const userId = req.user._id;

        if (!caption) return res.status(400).json({ success: false, message: "Caption is required." });
        if (!req.file) return res.status(400).json({ success: false, message: "An image file is required." });

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const cloudinaryResult = await cloudinary.uploader.upload(dataURI, {
            folder: "jsocial/posts"
        });

        const imgUrl = cloudinaryResult.secure_url;
        const publicId = cloudinaryResult.public_id;


        let newPost = await Post.create({
            user: userId,
            caption,
            imgUrl,
            publicId,
            likes: [],
            comments: []
        });

        await newPost.populate("user", "fullname username profileImg");

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

export const getAllPost = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const allPosts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "user",
                select: "fullname username profileImg"
            })
            .populate({
                path: "comments.user",
                select: "fullname username profileImg"
            });

        // Count total documents to know if there are more posts to fetch
        const totalPosts = await Post.countDocuments();
        const hasMore = skip + allPosts.length < totalPosts;

        return res.status(200).json({
            success: true,
            allPosts,
            hasMore
        });

    } catch (error) {
        console.log("Error in getAllPost: ", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unliking
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
            return res.status(200).json({ success: true, action: "unliked", userId });
        } else {
            // Liking
            await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });

            // Sending notification
            if (post.user.toString() !== req.user._id.toString()) {
                // 1. Save to database
                const newNotification = new Notification({
                    sender: req.user._id,
                    recipient: post.user,
                    type: "like",
                    post: post._id
                });
                await newNotification.save();

                // 2. REAL-TIME SOCKET EMISSION
                const receiverSocketId = getReceiverSocketId(post.user.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", {
                        type: "like",
                        message: `${req.user.username} liked your post!`,
                        sender: {
                            username: req.user.username,
                            profileImg: req.user.profileImg
                        }
                    });
                }
            }

            return res.status(200).json({ success: true, action: "liked", userId });
        }
    } catch (error) {
        console.error("Error in toggleLike:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const { text } = req.body;

        if (!text) return res.status(400).json({ success: false, message: "Comment text is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const newComment = { user: userId, text };

        // Push new comment and save
        post.comments.push(newComment);
        await post.save();

        // Adding notification
        if (post.user.toString() !== req.user._id.toString()) {
            // 1. Save to database
            const newNotification = new Notification({
                sender: req.user._id,
                recipient: post.user,
                type: "comment",
                post: post._id
            });
            await newNotification.save();

            // 2. REAL-TIME SOCKET EMISSION
            const receiverSocketId = getReceiverSocketId(post.user.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", {
                    type: "comment",
                    message: `${req.user.username} commented on your post!`,
                    sender: {
                        username: req.user.username,
                        profileImg: req.user.profileImg
                    }
                });
            }
        }

        await post.populate("comments.user", "fullname username profileImg");

        // The new comment will be the last one in the array
        const populatedComment = post.comments[post.comments.length - 1];

        return res.status(201).json({ success: true, message: "Comment added", comment: populatedComment });
    } catch (error) {
        console.error("Error in addComment:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        // 1. Grab the post ID from the URL parameters
        const postId = req.params.id;

        // 2. Grab the logged-in user's ID (provided by your ProtectedRoute middleware)
        const userId = req.user._id;

        // 3. Find the post in the database
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // 4. SECURITY CHECK: Verify the logged-in user is the actual creator of the post
        if (post.user.toString() !== userId.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: You can only delete your own posts"
            });
        }

        // --- Cloudinary Image Deletion ---
        if (post.publicId) {
            await cloudinary.uploader.destroy(post.publicId);
        }

        // 5. Delete the post from the database
        await Post.findByIdAndDelete(postId);

        // 6. (Optional but recommended) Remove the post ID from the user's `posts` array if you are storing it there
        await User.findByIdAndUpdate(userId, {
            $pull: { posts: postId }
        });

        // 7. Send success response
        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.error("Error in deletePost controller: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};