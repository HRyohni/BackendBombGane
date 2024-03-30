import User from '../models/userModel.js';
import bcrypt from 'bcrypt'
import {createHash} from "crypto";

const roomData = {};

function generateHash(string) {
    return bcrypt.hashSync(string, bcrypt.genSaltSync(10));
}

function _excludeProperties() {
    return true;
}

async function _comparePasswords(password, hashPassword) {
    console.log("Input Password:", password);
    console.log("Stored Hashed Password:", hashPassword);

    const result = await bcrypt.compare(password, hashPassword);
    console.log("Password Comparison Result:", result);

    return result;
}

async function checkCredentials(username, password) {
    const user = await User.findOne({"username": username});

    if (!user) {
        console.log("can't find user!");
        return false;
    }

    return await _comparePasswords(password, user.password) ? _excludeProperties() : false;
}


async function fetchData(username) {
    return User.findOne({username: username});
}


// Function to add a user to a room
function addUserToRoom(roomName, userName) {
    console.log(roomData);
    // Check if the room exists in the data object
    if (!roomData.hasOwnProperty(roomName)) {
        // If the room doesn't exist, create an empty array for it
        roomData[roomName] = [];
    }

    // Add the user to the room
    roomData[roomName].push(userName);

    // Optionally, you can return the updated array for further use
    return roomData[roomName];
}

function getRoomData(roomName) {
    return roomData[roomName];
}




async function removeUserFromRoom(userId, room) {
    try {
        const roomData = await userMethods.getRoomData(room);

        // Find the index of the user in the array
        const userIndex = roomData.findIndex(user => user.id === userId);

        // If the user is found, remove them from the array
        if (userIndex !== -1) {
            roomData.splice(userIndex, 1);
            console.log(`User with id ${userId} removed from room ${room}`);
        } else {
            console.log(`User with id ${userId} not found in room ${room}`);
        }

        // Update the room data in your database or storage
        // Assuming your data is stored in a database, update it here
        // For example, you might use Mongoose to update the user list in the database

        // Save the updated room data (this is just a placeholder, replace it with your actual logic)
        // await saveUpdatedRoomDataToDatabase(room, roomData);

        return roomData;
    } catch (error) {
        console.error("Error removing user from room:", error);
        return [];
    }
}

function nextPlayerTurn(roomName, currentMainPlayer) {
    return roomData[roomName][roomData[roomName].findIndex(x => x === currentMainPlayer)+1]; //ToDo: fix overfill with arrey
}

export const userMethods = {
    checkCredentials,
    generateHash,
    fetchData,
    addUserToRoom,
    getRoomData,
    nextPlayerTurn,
    removeUserFromRoom(id, room) {

    }
}