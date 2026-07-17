import mongoose from "mongoose";

export const ConnectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected Successfully!!!")
    } catch (error) {
        console.log("Error while connecting DB", error.message)
    }
}