import jwt from "jsonwebtoken"

export const GenerateToken = async (userId, res) => {
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })

        if (!token) {
            return res.status(200).json("Unable to generate the Token")
        }

        res.cookie("JWT", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // must be true when sameSite is "none"
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

    } catch (error) {
        console.log("Error while generating a token", error.message)
    }
}