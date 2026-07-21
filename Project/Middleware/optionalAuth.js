import jwt from "jsonwebtoken"
import { User } from "../Models/user.model.js"

export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.JWT;

        // 1. If there's no token, treat them as a guest and proceed
        if (!token) {
            req.user = null;
            return next();
        }

        // 2. If there is a token, try to verify it safely
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            
            if (decode && decode.userId) {
                let user = await User.findById(decode.userId).select("-password");
                req.user = user || null; // Attach user if found in DB
            } else {
                req.user = null;
            }
        } catch (err) {
            // jwt.verify throws an error if the token is expired or altered.
            // We catch it here so the app doesn't crash, and treat them as a guest.
            req.user = null;
        }

        // 3. Move to the next function (the controller)
        next();

    } catch (error) {
        console.log("Error in optionalAuth logic", error.message);
        req.user = null;
        next();
    }
}