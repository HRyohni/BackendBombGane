import mongoose from "mongoose";
const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    words: {
        type: Array,
        required: true,

    },
    description: {
        type: String,
        required: false,
    },

    Author: {
        type: String,
        required: false,
    },
});

const GameMode = mongoose.model("GameMode", gameSchema);
export default GameMode;