import express from 'express'
import { commentPost, createPost, getAllPost, likePost } from '../Controller/post.controller.js'
import { ProtectedRoute } from '../Middleware/ProtectedRoute.js'
import { upload } from "../utils/cloudinary.js";

const router = express.Router()

router.post("/create", ProtectedRoute, upload.single("image"), createPost);
router.post("/like/:id", ProtectedRoute, likePost);
router.get("/all", getAllPost);
router.post("/comment/:id", ProtectedRoute, commentPost)

export default router;
