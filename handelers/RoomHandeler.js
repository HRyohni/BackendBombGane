import roomDB from "../models/roomModel.js";

async function createRoom(data) {
    const {roomName, gameModeName, lives, timer, timePerPlayer} = data;
    const roomdb = new roomDB({
        Room: {
            roomName: roomName,
            gameModeName: gameModeName,
            lives: lives,
            timer: timer,
            timePerPlayer: timePerPlayer,

            playersCount: 0,
            playersName: [],
            roomPassword: ""
        }

    });
    await roomdb.save();
    return "New Room saved"
}

async function fetchRooms()
{
    try {
        return await roomDB.find({});
    } catch (error) {
        console.error(error);

    }
}


export const roomMethods = {
    createRoom,
    fetchRooms

}