import express from "express"
import { FollowUnfollow, getFollowers, getFollowing, getUserById, getUserProfile, searchUsers, suggestedUser } from "../Controller/user.controller.js"
import { ProtectedRoute } from "../Middleware/ProtectedRoute.js"
import { optionalAuth } from "../Middleware/optionalAuth.js"

const router = express.Router()

// --- Static / fixed-segment routes FIRST ---
router.get("/suggested", optionalAuth, suggestedUser)
router.get("/search", ProtectedRoute, searchUsers)

router.get("/profile/:username", getUserProfile);
router.get("/profile/:username/followers", ProtectedRoute, getFollowers)
router.get("/profile/:username/following", ProtectedRoute, getFollowing)

router.post("/follow/:id", ProtectedRoute, FollowUnfollow)

// --- Dynamic single-segment catch-all LAST ---
router.get("/:id", getUserById)

export default router