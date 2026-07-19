import express from "express"
import { ProtectedRoute } from "../Middleware/ProtectedRoute.js"
import { getNotifications, deleteAllNotifications } from "../Controller/notification.controller.js"

const router = express.Router()

//Notification Feature
router.get("/", ProtectedRoute, getNotifications)
router.delete("/", ProtectedRoute, deleteAllNotifications)

export default router
