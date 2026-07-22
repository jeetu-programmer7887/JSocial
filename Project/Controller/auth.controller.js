import { User } from "../Models/user.model.js"
import bcrypt from "bcryptjs"
import { GenerateToken } from "../utils/generateToken.js"
import { v2 as cloudinary } from "cloudinary"

export const Register = async (req, res) => {
    try {
        let { fullname, username, email, password } = req.body

        if (!fullname || !username || !email || !password) {
            return res.status(400).json("All fields are required!!!")
        }

        let exsistingUsername = await User.findOne({ username })

        if (exsistingUsername) {
            return res.status(400).json("Username already exsist!!")
        }

        let exsistingEmail = await User.findOne({ email })
        if (exsistingEmail) {
            return res.status(400).json("email already exsist!!")
        }

        if (password.length < 6) {
            res.status(400).json("Password length must be greater than 5")
        }

        const hashPass = await bcrypt.hash(password, 10)

        let newUser = await User.create({
            fullname,
            username,
            email,
            password: hashPass
        })


        return res.status(200).json(newUser)


    } catch (error) {
        console.log("Error in Register Controller", error.message)
    }
}

export const Login = async (req, res) => {
    try {

        let { username, password } = req.body

        let user = await User.findOne({ username })

        if (!user) {
            return res.status(404).json("Invalid credentials")
        }

        const checkPass = await bcrypt.compare(password, user.password)
        if (!checkPass) {
            return res.status(404).json("Invalid credentials")
        }

        await GenerateToken(user._id, res)

        let loggedInuser = await User.findById(user._id).select("-password")

        return res.status(200).json(loggedInuser)


    } catch (error) {
        console.log("Error in Login Controller", error.message)
    }
}

export const Logout = async (req, res) => {
    try {
        res.clearCookie("JWT")
        return res.status(200).json({ message: "User loggedOut successFully!!" })
    } catch (error) {
        console.log("Error in Logout Controller", error.message)
    }
}

export const getMe = async (req, res) => {
    try {
        return res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in get ME controller", error.message)
    }
}

const extractPublicId = (url) => {
    const afterUpload = url.split('/upload/')[1];
    return afterUpload.replace(/^v\d+\//, '').split('.')[0];
};

export const UpdateUser = async (req, res) => {
    try {
        let { fullname, username, email, currentPass, newPass, profileImg, coverImg } = req.body;

        const userId = req.user._id;
        let user = await User.findById(userId);

        if (!user) return res.status(404).json("No user found");

        // Uniqueness checks
        if (username && username !== user.username) {
            let existingUsername = await User.findOne({ username });
            if (existingUsername) return res.status(400).json("Username is already taken!!");
        }

        if (email && email !== user.email) {
            let existingEmail = await User.findOne({ email });
            if (existingEmail) return res.status(400).json("Email is already taken!!");
        }

        // Password logic
        if ((!currentPass && newPass) || (!newPass && currentPass)) {
            return res.status(400).json("Both currentPass and newPass is required!!!");
        }

        if (currentPass && newPass) {
            const isMatch = await bcrypt.compare(currentPass, user.password);
            if (!isMatch) return res.status(400).json("CurrentPass is incorrect!!!!");
            if (newPass.length < 6) return res.status(400).json("newPass must be greater than 6 characters!!!!");

            let hashedPass = await bcrypt.hash(newPass, 10);
            user.password = hashedPass;
        }

        if (profileImg) {
            if (user.profileImg) {
                const publicId = extractPublicId(user.profileImg);
                await cloudinary.uploader.destroy(publicId);
            }

            // Pass the folder option to upload it to a specific directory
            const uploadResponse = await cloudinary.uploader.upload(profileImg, {
                folder: "jsocial/profiles"
            });
            profileImg = uploadResponse.secure_url;
        }

        // 2. Cover Image Cloudinary Logic
        if (coverImg) {
            if (user.coverImg) {
                const publicId = extractPublicId(user.coverImg);
                await cloudinary.uploader.destroy(publicId);
            }

            // Pass the folder option to upload it to a specific directory
            const uploadResponse = await cloudinary.uploader.upload(coverImg, {
                folder: "jsocial/covers"
            });
            coverImg = uploadResponse.secure_url;
        }

        // Update fields
        user.fullname = fullname || user.fullname;
        user.username = username || user.username;
        user.email = email || user.email;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;

        return res.status(200).json(user);

    } catch (error) {
        console.log("Error while Writing the Update logic", error.message);
        return res.status(500).json("Internal server error. Failed to update profile.");
    }
}
