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
    console.log(username);
    console.log(user);

    if (!user) {
        console.log("can't find user!");
        return false;
    }

    console.log("Stored Hashed Password:", user.password);

    return await _comparePasswords(password, user.password) ? _excludeProperties() : false;
}


async function fetchData(username) {
    return User.findOne({username: username});
}


// Function to add a user to a room
function addUserToRoom(roomName, userName) {
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


function fetchFirstPlayer(roomName) {
    return roomData[roomName][Math.floor(Math.random() * roomData[roomName].length)];
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
    fetchFirstPlayer,
    nextPlayerTurn
}