import express from "express"
import { FollowUnfollow, suggestedUser } from "../Controller/user.controller.js"
import { ProtectedRoute } from "../Middleware/ProtectedRoute.js"

const router = express.Router()

router.get("/suggested", ProtectedRoute, suggestedUser)
router.post("/follow/:id", ProtectedRoute, FollowUnfollow)

export default router