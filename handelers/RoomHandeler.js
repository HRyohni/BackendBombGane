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

async function fetchRooms() {
    try {
        return await roomDB.find();
    } catch (error) {
        console.error(error);

    }
}

async function fetchRoomByID(roomID) {

    try {
        const records = await roomDB.find({});

        for (const record of records) {
            if (record._id.toString() === roomID) {
                return record.Room;
            }
        }
        return null;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function updateRoomById(roomId, newData) {
    try {

        const updatedRoom = await roomDB.findByIdAndUpdate({_id:roomId}, { Room: newData });
        if (!updatedRoom) {
            console.log("Room not found");
            return null;
        }
        return updatedRoom;
    } catch (error) {
        console.error("Error updating room:", error);
        throw error; // Throw the error for handling upstream
    }
}

async function removePlayerFromRoom(roomID)
{
    let room = await fetchRoomByID(roomID)
    console.log(room);
}


export const roomMethods = {
    createRoom,
    fetchRooms,
    fetchRoomByID,
    updateRoomById

}