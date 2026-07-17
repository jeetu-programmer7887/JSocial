import jwt from "jsonwebtoken"
import { User } from "../Models/user.model.js"


export const ProtectedRoute = async(req, res, next)=>{
    try {
        const token = req.cookies.JWT

        if(!token){
            return res.status(400).json("No user Found")
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)
        if(!decode){
            return res.status(400).json("Invalid Credentials")
        }

        let user = await User.findById(decode.userId).select("-password")

        req.user = user
        next()

    } catch (error) {
        console.log("Error in ProtectedRoute logic", error.message)
    }
}   