import { User } from "../Models/user.model.js"
import bcrypt from "bcryptjs"
import {v2 as cloudinary} from 'cloudinary'

export const GetProfile = async (req, res) => {
    try {

        const user = req.user
        return res.status(200).json(user)

    } catch (error) {
        console.log("Error in GetProfile controller", error.message)
    }
}

export const FollowUnfollow = async (req, res) => {
    try {

        const { id } = req.params

        const authUser = await User.findById(req.user._id)
        const otherUser = await User.findById(id)

        if (req.user._id.toString() === id) {
            return res.status(400).json("U can't follow/unfollow urself")
        }

        if (!authUser || !otherUser) {
            return res.status(400).json("No user found")
        }


        const isFollowing = authUser.following.includes(id)

        if (isFollowing) { //Auth user is following
            await User.findByIdAndUpdate(authUser._id, { $pull: { following: id } }) // auth user ke following se nikala
            await User.findByIdAndUpdate(id, { $pull: { followers: authUser._id } }) // other user ke followers se nikala
            return res.status(200).json("User Unfollowed Sucessfully!!!")
        } else {
            await User.findByIdAndUpdate(authUser._id, { $push: { following: id } }) // auth user ke following me add kiya
            await User.findByIdAndUpdate(id, { $push: { followers: id } }) // other user ke followers mein add kiya
            return res.status(200).json("User Followed Sucessfully!!!")
        }

    } catch (error) {
        console.log("Error in FollowUnfollow Controller", error.message)
    }
}

export const suggestedUser = async (req, res) => {
    try {

        const userId = req.user._id

        const authUser = await User.findById(userId)

        const SuggestedUser = await User.aggregate([
            {
                $match: {
                    _id: {
                        $ne: userId, //not equal to this id
                        $nin: authUser.following //does not includes these IDs
                    }
                }
            },
            {
                $sample: { size: 4 } //just like limits
            },
            {
                $project: {
                    password: 0 //just like select (-password)
                }
            }
        ])

        return res.status(200).json({ messgae: "All users", SuggestedUser })

    } catch (error) {
        console.log("Error in suggested User controller", error.message)
    }
}

export const UpdateUser = async (req, res) => {
    try {
        let { fullname, username, email, currentPass, newPass } = req.body
        let { profileImg } = req.body //expected a buffer format

        const userId = req.user._id

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json("No user found")
        }

        if ((!currentPass && newPass) || (!newPass && currentPass)) {
            return res.status(400).json("Both currentPass and newPass is required!!!")
        }

        if (currentPass && newPass) {
            const isMatch = await bcrypt.compare(currentPass, user.password)
            if (!isMatch) {
                return res.status(400).json("CurrentPass is incorrect!!!!")
            }

            if (newPass.length < 6) {
                return res.status(400).json("newPass must be greater than 6 characters!!!!")
            }

            let hashedPass = await bcrypt.hash(newPass, 10);

            user.password = hashedPass
        }

        if (profileImg) {
            if(user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0])
            }

            const uploadResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadResponse.secure_url

        }

        user.fullname = fullname || user.fullname
        user.username = username || user.username
        user.email = email || user.email
        user.profileImg = profileImg || user.profileImg

        user = await user.save()

        user.password = null;

        return res.status(200).json(user)

    } catch (error) {
        console.log("Error while Writting the Update logic", error.message)
    }
}
