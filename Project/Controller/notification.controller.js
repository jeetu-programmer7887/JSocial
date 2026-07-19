import { Notification } from "../Models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch notifications and populate the sender's details
        const notifications = await Notification.find({ recipient: userId })
            .populate("sender", "fullname username profileImg")
            .populate("post", "imgUrl") // Grab post image for a thumbnail
            .sort({ createdAt: -1 });

        // Mark all unread notifications as read
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });

        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("Error in getNotifications:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        return res.status(200).json({ success: true, message: "Notifications deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
