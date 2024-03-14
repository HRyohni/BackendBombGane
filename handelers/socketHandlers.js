import {userMethods} from "./userHandler.js";
import {gameModeMethods} from "./GameModeHandler.js";

export function onSocketDisconnect(socket){
    socket.on('disconnect', async () => {
        console.log("User disconnected");

        // Iterate over all rooms the user was part of
        const rooms = Object.keys(socket.rooms);
        for (const room of rooms) {
            console.log(`User disconnected from room ${room}`);

            // Remove the disconnected user from the room
            await userMethods.removeUserFromRoom(socket.id, room);

            // Notify other users in the room about the disconnection
            io.to(room).emit('user left', socket.id);

            // Fetch and emit updated room data to all users in the room
            io.to(room).emit('getRoomData', userMethods.getRoomData(room));
        }
    });
}

export function  onNewUserConnected(socket){
    socket.on('new user', async ({username, room}) => {

        userMethods.addUserToRoom(room, username);
        console.log(userMethods.getRoomData(room), "<---");
        console.log(username, "joined room ", room);
        socket.to(room).emit('user joined', username);
    });
}

export function onChatMessage(socket){
    socket.on('chat message', ({message, username, room}) => {
        io.to(room).emit('chat message', {message, username}); // Emit message with username
    });
}

export function onFetchAllUsers(socket){
    socket.on('fetchUsers', (room) => {
        io.to(room).emit('getRoomData', userMethods.getRoomData(room)); // Emit message with username
    });
}

export function onNextPlayerTurn(socket){
    socket.on('nextPlayer', (room, currentMainPlayer) => {
        io.to(room).emit('getNextPlayer', userMethods.nextPlayerTurn(room, currentMainPlayer)); // Emit message with username
    });

}

export function onPickRandomPlayer(socket){
    socket.on('randomFirstPlayer', (room) => {
        io.to(room).emit('fetchFirstPlayer', userMethods.fetchFirstPlayer(room)); // Emit message with username
    });
}

export function onDisconnectFromAllRooms(socket){
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

export function onJoinRoom(socket){
    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.emit("broadcast", "omg you have new user");
        socket.to("room1").emit("some event");
    });
}

export function onStartGame(socket){
    socket.on('startGame', async (GameName, room) => {
        try {
            const lettersData = await gameModeMethods.StartGame(GameName);

            console.log(lettersData);
            io.to(room).emit("letters", lettersData);

        } catch (error) {

            console.error("Error starting the game:", error);
        }
    });
}

export function onCheckWord(socket){
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
    onSocketDisconnect,
    onNewUserConnected,
    onChatMessage,
    onFetchAllUsers,
    onNextPlayerTurn,
    onPickRandomPlayer,
    onDisconnectFromAllRooms,
    onJoinRoom,
    onStartGame,
    onCheckWord,


}