import express from "express" //(It's now handled in socket.js)
import dotenv from "dotenv"
import { connectDB } from "./utils/db.js"
import AuthRouter from "./Routes/auth.route.js"
import UserRouter from "./Routes/user.route.js"
import PostRouter from './Routes/post.route.js'
import MessageRouter from './Routes/message.route.js'
import NotificationRouter from './Routes/notification.route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'

import { app, server } from "./socket/socket.js"; 

dotenv.config()

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send("Server is Running...")
})

app.use("/api/auth", AuthRouter)
app.use("/api/user", UserRouter)
app.use("/api/post", PostRouter)
app.use("/api/notifications", NotificationRouter)
app.use("/api/messages", MessageRouter)

const port = process.env.PORT || 5000

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    connectDB()
})
