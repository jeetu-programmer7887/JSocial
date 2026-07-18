import express from "express"
import { FollowUnfollow, getFollowers, getFollowing, getUserProfile, searchUsers, suggestedUser } from "../Controller/user.controller.js"
import { ProtectedRoute } from "../Middleware/ProtectedRoute.js"

const router = express.Router()

router.get("/suggested", ProtectedRoute, suggestedUser)
router.post("/follow/:id", ProtectedRoute, FollowUnfollow)
router.get("/profile/:username", getUserProfile);
router.get("/profile/:username/followers", ProtectedRoute, getFollowers)
router.get("/profile/:username/following", ProtectedRoute, getFollowing)

//Search route
router.get("/search", ProtectedRoute, searchUsers)

export default router