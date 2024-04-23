import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    mail: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: true,
    },

    confettiColor: {
        type: String,
        required: true,
    },
    victoryBackground: {
        type: String,
        required: true,
    },
    money: {
        type: Number,
        required: true,
    },
    scoreboard: {
        type: Number,
        required: false,
    },
});


const User = mongoose.model("user", userSchema);
export default User;

