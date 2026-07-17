import { User } from "../Models/user.model.js";

export const FollowUnfollow = async (req, res) => {
    try {
        const { id } = req.params;
        const authUser = await User.findById(req.user._id);
        const otherUser = await User.findById(id);

        if (req.user._id.toString() === id.toString()) {
            return res.status(400).json("You can't follow/unfollow yourself");
        }

        if (!authUser || !otherUser) {
            return res.status(400).json("No user found");
        }

        const isFollowing = authUser.following.includes(id);

        if (isFollowing) { 
            // UNFOLLOW
            await User.findByIdAndUpdate(authUser._id, { $pull: { following: id } }); 
            await User.findByIdAndUpdate(id, { $pull: { followers: authUser._id } }); 
            return res.status(200).json("User Unfollowed Successfully!!!");
        } else {
            // FOLLOW
            await User.findByIdAndUpdate(authUser._id, { $push: { following: id } }); 
            // 🚨 FIXED: Pushing authUser._id into the other user's followers array!
            await User.findByIdAndUpdate(id, { $push: { followers: authUser._id } }); 
            return res.status(200).json("User Followed Successfully!!!");
        }

    } catch (error) {
        console.log("Error in FollowUnfollow Controller", error.message);
        return res.status(500).json("Internal Server Error"); // 🚨 Added to prevent UI hang
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
        return res.status(500).json("Internal Server Error"); // 🚨 Added to prevent UI hang
    }
}
