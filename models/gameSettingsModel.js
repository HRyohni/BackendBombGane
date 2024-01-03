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
});

const GameMode = mongoose.model("GameMode", gameSchema);
export default GameMode;