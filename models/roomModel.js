import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
    Room:{
        type: Object,
        required: true,
    },


});

const roomDB = mongoose.model("roomDB", roomSchema);
export default roomDB;


// const gameModes = mongoose.model("gamemodes", userSchema);
// export default gameModes;