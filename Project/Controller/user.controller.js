import { User } from "../Models/user.model.js";
import { Post } from "../Models/post.model.js"; 
import { Notification } from "../Models/notification.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js"; 

export const FollowUnfollow = async (req, res) => {
    try {
        const { id } = req.params;
        const authUser = await User.findById(req.user._id);
        const otherUser = await User.findById(id);

        if (req.user._id.toString() === id.toString()) {
            return res.status(400).json("You can't follow yourself");
        }

        if (!authUser || !otherUser) {
            return res.status(400).json("No user found");
        }

        const isFollowing = authUser.following.includes(id);

        if (isFollowing) {
            // UNFOLLOW LOGIC
            await User.findByIdAndUpdate(authUser._id, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: authUser._id } });
            return res.status(200).json("User Unfollowed Successfully!!!");
        } else {
            // FOLLOW LOGIC
            await User.findByIdAndUpdate(authUser._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: authUser._id } });

            // Save notification to Database
            const newNotification = new Notification({
                sender: req.user._id,
                recipient: id, 
                type: "follow",
            });
            await newNotification.save();

            // 👇 2. REAL-TIME SOCKET EMISSION
            // Check if the user being followed is currently online
            const receiverSocketId = getReceiverSocketId(id);
            if (receiverSocketId) {
                // If they are online, send them an event called "newNotification"
                io.to(receiverSocketId).emit("newNotification", {
                    type: "follow",
                    message: `${authUser.username} started following you!`,
                    sender: {
                        username: authUser.username,
                        profileImg: authUser.profileImg
                    }
                });
            }

            return res.status(200).json("User Followed Successfully!!!");
        }

    } catch (error) {
        console.log("Error in FollowUnfollow Controller", error.message);
        return res.status(500).json("Internal Server Error");
    }
}

export const suggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const authUser = await User.findById(userId);

        const SuggestedUser = await User.aggregate([
            {
                $match: {
                    _id: {
                        $ne: userId,
                        $nin: authUser.following
                    }
                }
            },
            {
                $sample: { size: 4 }
            },
            {
                $project: {
                    password: 0
                }
            }
        ]);

        return res.status(200).json({ message: "All users", SuggestedUser });

    } catch (error) {
        console.log("Error in suggested User controller", error.message);
        return res.status(500).json("Internal Server Error");
    }
}

export const getUserProfile = async (req, res) => {
    try {
        // 1. Grab the username from the URL parameters (e.g., /api/user/profile/:username)
        const { username } = req.params;

        // 2. Find the user in the database
        // .select("-password") ensures we NEVER send the hashed password to the frontend
        const user = await User.findOne({ username })
            .select("-password")
            .populate("followers", "username profileImg") // Optional: Populate if you want to show a followers list later
            .populate("following", "username profileImg");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 3. Fetch all posts created by this specific user (sorted newest to oldest)
        const userPosts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate("comments.user", "username profileImg"); // Populate comment authors

        // 4. Combine the user data and their posts into a single profile object
        const profile = {
            ...user.toObject(), // Converts the Mongoose document to a plain JavaScript object
            posts: userPosts
        };

        // 5. Send the successful response back to the frontend
        return res.status(200).json({
            success: true,
            profile
        });

    } catch (error) {
        console.log("Error in fetching User details: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const getFollowers = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate("followers", "fullname username profileImg");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, users: user.followers });
    } catch (error) {
        console.error("Error in getFollowers: ", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate("following", "fullname username profileImg");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, users: user.following });
    } catch (error) {
        console.error("Error in getFollowing: ", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query; // Grabbing the search term from the URL

        // If the search bar is empty, return an empty array
        if (!query) {
            return res.status(200).json({ success: true, users: [] });
        }

        // Search for partial matches in either username or fullname (case-insensitive)
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { fullname: { $regex: query, $options: "i" } }
            ]
        })
            .select("fullname username profileImg") // Only grab what we need for the UI
            .limit(6); // Limit results so the dropdown doesn't get massive

        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error in searchUsers: ", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
