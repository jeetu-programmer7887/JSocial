import express from 'express'
import { addComment, createPost, deletePost, getAllPost, toggleLike } from '../Controller/post.controller.js'
import { ProtectedRoute } from '../Middleware/ProtectedRoute.js'
import { upload } from "../utils/cloudinary.js";

const router = express.Router()

router.post("/create", ProtectedRoute, upload.single("image"), createPost);
router.post("/like/:id", ProtectedRoute, toggleLike);
router.get("/all", getAllPost);
router.post("/comment/:id", ProtectedRoute, addComment)
router.delete("/delete/:id", ProtectedRoute, deletePost)


export default router;
