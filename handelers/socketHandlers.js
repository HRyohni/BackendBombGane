import {userMethods} from "./userHandler.js";
import {gameModeMethods} from "./GameModeHandler.js";
import {roomMethods} from "./RoomHandeler.js";

const rooms = {};

export function onJoinRoom(socket) {
    socket.on('joinRoom', (roomName, playerName) => {
        // Create room if it doesn't exist
        if (!rooms[roomName]) {
            rooms[roomName] = {sockets: new Set(), playersName: []};
            console.log("created room")
        }

        // Add the socket to the room
        socket.join(roomName);
        rooms[roomName].sockets.add(socket.id);
        rooms[roomName].playersName.push(playerName);

        console.log(`Socket ${socket.id} joined room ${roomName} as ${playerName}`);
        console.log(`Players in room ${roomName}: ${rooms[roomName].playersName}`);
    });
}

export function onUserDisconnect(socket) {
    socket.on('disconnectUserFromRoom', (roomName, userName) => {
        if (rooms.hasOwnProperty(roomName)) {
            rooms[roomName].sockets.delete(socket);
            const index = rooms[roomName].playersName.indexOf(userName);
            if (index !== -1) {
                rooms[roomName].playersName.splice(index, 1);
            }
            console.log(userName, " user disconnected from ", roomName);
            roomMethods.removePlayerFromRoom(roomName, userName);
        }

    });
}


export function onChatMessage(socket) {

    socket.on('sendMessage', ({message, username, room}) => {
        socket.to(room).emit('newMessage', {username: username, message: message});
    });
}


export function onSocketDisconnect(socket) {
    socket.on('disconnect', async () => {
        console.log("User disconnected");

        // Iterate over all rooms the user was part of
        const rooms = Object.keys(socket.rooms);
        for (const room of rooms) {
            console.log(`User disconnected from room ${room}`);

            // Remove the disconnected user from the room
            await userMethods.removeUserFromRoom(socket.id, room);

            // Notify other users in the room about the disconnection
            socket.to(room).emit('user left', socket.id);

            // Fetch and emit updated room data to all users in the room
            socket.to(room).emit('getRoomData', userMethods.getRoomData(room));
        }
    });
}

export function onNewUserConnected(socket) {
    socket.on('new user', async ({username, room}) => {

        userMethods.addUserToRoom(room, username);
        console.log(userMethods.getRoomData(room), "<---");
        console.log(username, "joined room ", room);
        socket.to(room).emit('user joined', username);
    });
}


export function onFetchAllUsers(socket) {
    socket.on('fetchUsers', (room) => {
        socket.to(room).emit('getRoomData', userMethods.getRoomData(room)); // Emit message with username
    });
}

export function onNextPlayerTurn(socket) {
    socket.on('nextPlayer', (room, currentMainPlayer) => {
        socket.to(room).emit('getNextPlayer', userMethods.nextPlayerTurn(room, currentMainPlayer)); // Emit message with username
    });

}

export function onPickRandomPlayer(socket) {
    socket.on('randomFirstPlayer', (room) => {
        socket.to(room).emit('fetchFirstPlayer', userMethods.fetchFirstPlayer(room)); // Emit message with username
    });
}

export function onDisconnectFromAllRooms(socket) {
    socket.on('disconnectFromAllRooms', () => {
        // Get all rooms user has joined
        const rooms = socket.rooms;
        console.log(socket.rooms);

        // Leave all rooms
        rooms.forEach((room) => {
            if (room !== socket.id) { // Don't leave the default room (socket.id)
                socket.leave(room);
                console.log("user disconnected from ", room);
            }
        });
    });
}


export function onStartGame(socket) {
    socket.on('startGame', async (GameName, room) => {
        try {
            const lettersData = await gameModeMethods.StartGame(GameName);

            console.log(lettersData);
            socket.to(room).emit("letters", lettersData);

        } catch (error) {

            console.error("Error starting the game:", error);
        }
    });
}

export function onCheckWord(socket) {
    socket.on('checkWord', async (GameName, word) => {
        socket.to("some room").emit("room1");
        try {
            const lettersData = await gameModeMethods.doesWordExist("colors", word);
            socket.emit("result", lettersData);
        } catch (error) {
            console.error("Error starting the game:", error);
        }
    });
}


export const socketMethods = {
    onJoinRoom,
    onUserDisconnect,
    onChatMessage,


}