import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
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
});

const User = mongoose.model("user", userSchema);
export default User;


// const gameModes = mongoose.model("gamemodes", userSchema);
// export default gameModes;