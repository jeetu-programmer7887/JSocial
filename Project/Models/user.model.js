import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default: []
        }
    ],
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default: []
        }
    ],
    profileImg:{
        type:String,
        default: ""
    }
    
},{timestamps: true})

export const User = mongoose.model("User", UserSchema)