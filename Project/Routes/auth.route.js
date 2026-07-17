import express from "express"
import { getMe, Login, Logout, Register } from "../Controller/auth.controller.js"
import { ProtectedRoute } from "../Middleware/ProtectedRoute.js"

const router = express.Router()

router.post("/register",Register)
router.post("/login",Login)
router.get("/logout",Logout)
router.get("/me",ProtectedRoute,getMe)

export default router