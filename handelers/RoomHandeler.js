import roomDB from "../models/roomModel.js";

async function createRoom(data) {
    const {host,roomName, gameModeName, lives, timer, timePerPlayer} = data;
    const roomdb = new roomDB({
        Room: {
            host: host,
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

async function removePlayerFromRoom(roomID, username) {
    try {
        // Fetch the room based on the provided roomID
        let room = await fetchRoomByID(roomID);

        if (!room) {
            console.log("Room not found");
            return null;
        }
        room.playersName = room.playersName.filter(player => player !== username);

        // Update the room in the database
        const updatedRoom = await roomDB.findOneAndUpdate(
            { _id: roomID },
            { $set: { "Room.playersName": room.playersName } },
            { new: true }
        );
        return true;
    } catch (error) {
        console.error("Error removing player from room:", error);
        throw error; // Throw the error for handling upstream
    }
}

export const roomMethods = {
    createRoom,
    fetchRooms,
    fetchRoomByID,
    updateRoomById,
    removePlayerFromRoom

}