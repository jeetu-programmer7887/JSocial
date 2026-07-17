import express from "express"
import { FollowUnfollow, GetProfile, suggestedUser, UpdateUser } from "../Controller/user.controller.js"
import { ProtectedRoute } from "../Middleware/ProtectedRoute.js"

const router = express.Router()


router.get("/profile",ProtectedRoute, GetProfile)
router.get("/suggested", ProtectedRoute, suggestedUser)
router.post("/follow/:id", ProtectedRoute, FollowUnfollow)
router.get("/update", ProtectedRoute, UpdateUser)

export default router