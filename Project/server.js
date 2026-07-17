import express from "express"
import dotenv from "dotenv"
import { ConnectDB } from "./utils/db.js"
import AuthRouter from "./Routes/auth.route.js"
import UserRouter from "./Routes/user.route.js"
import PostRouter from './Routes/post.route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'

dotenv.config()

const app = express()

const corsOptions = {
    origin: 'http://localhost:5173',
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

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    ConnectDB()
})
