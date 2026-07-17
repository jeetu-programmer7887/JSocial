import { User } from "../Models/user.model.js"
import bcrypt from "bcryptjs"
import { GenerateToken } from "../utils/generateToken.js"

export const Register = async(req, res) => {
    try {
        let {fullname, username, email, password} = req.body

        if(!fullname || !username || !email || !password){
            return res.status(400).json("All fields are required!!!")
        }

        let exsistingUsername = await User.findOne({username})

        if(exsistingUsername){
            return res.status(400).json("Username already exsist!!")
        }

        let exsistingEmail = await User.findOne({email})
        if(exsistingEmail){
            return res.status(400).json("email already exsist!!")
        }

        if(password.length < 6){
            res.status(400).json("Password length must be greater than 5")
        }

        const hashPass = await bcrypt.hash(password, 10)

        let newUser = await User.create({
            fullname,
            username,
            email,
            password:hashPass
        })


        return res.status(200).json(newUser)


    } catch (error) {
        console.log("Error in Register Controller", error.message)
    }
}

export const Login = async(req, res) => {
    try {
        
        let {username, password} = req.body

        let user = await User.findOne({username})

        if(!user){
            return res.status(404).json("Invalid credentials")
        }

        const checkPass = await bcrypt.compare(password, user.password)
        if(!checkPass){
            return res.status(404).json("Invalid credentials")
        }

        GenerateToken(user._id, res)

        let loggedInuser = await User.findById(user._id).select("-password")

        return res.status(200).json(loggedInuser)


    } catch (error) {
        console.log("Error in Login Controller", error.message)
    }
}

export const Logout = async(req, res) => {
    try {
        res.clearCookie("JWT")
        return res.status(200).json({message: "User loggedOut successFully!!"})
    } catch (error) {
        console.log("Error in Logout Controller", error.message)
    }
}

export const getMe = async(req, res) => {
    try {
        return res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in get ME controller", error.message)
    }
}