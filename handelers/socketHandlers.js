import {userMethods} from "./userHandler.js";
import {gameModeMethods} from "./GameModeHandler.js";
import {roomMethods} from "./RoomHandeler.js";

const rooms = {};

export function onJoinRoom(socket) {
    socket.on('joinRoom', (roomName, playerName) => {
        // Create room if it doesn't exist
        if (!rooms[roomName]) {
            rooms[roomName] = {sockets: new Set(), playersName: []};
        }
        // Add the socket to the room
        socket.join(roomName);
        rooms[roomName].sockets.add(socket.id);
        rooms[roomName].playersName.push(playerName);

        socket.to(roomName).emit('newPlayerJoined', playerName);
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
            roomMethods.removePlayerFromRoom(roomName, userName)
            socket.to(roomName).emit("playerLeftParty");

        }

    });
}


export function onChatMessage(socket) {
    socket.on('sendMessage', ({message, username, room}) => {
        socket.to(room).emit('newMessage', username, message);
    });
}

export function onJoinOrLeaveMsg(socket) {
    socket.on('userJoined', (user, room, message) => {
        socket.to(room).emit('newMessage', user, message);

    });

    socket.on('userLeft', (user, room, message) => {
        socket.to(room).emit('newMessage', user, message);
    });


}

export function onPlayerReady(socket) {
    socket.on('sendPlayerReady', (username, room) => {
        socket.to(room).emit('getPlayerReady', username);
    });
}

export function onPlayerNotReady(socket) {
    socket.on('sendPlayerNotReady', (username, room) => {
        socket.to(room).emit('getPlayerNotReady', username);
    });
}

export function onPickRandomPlayer(socket) {

    socket.on('pickRandomFirstPlayer', (room, players) => {
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        socket.emit('fetchFirstPlayer', randomPlayer); // Emit to sender
        socket.to(room).emit('fetchFirstPlayer', randomPlayer); // Broadcast to others in the room
    });
}

export function clientSideTimerUpdate(socket) {
    socket.on('timerUpdate', (room, timer) => {
        socket.to(room).emit('timerGetUpdate', timer); // Emit message with username
    });
}

export function getLetters(socket) {
    socket.on('getLetters', (room, words) => {

        // Pick a random word from the array
        const randomWord = words[Math.floor(Math.random() * words.length)];

        // Ensure the word has at least two characters
        if (randomWord.length < 2) {
            console.error("Word is too short to select letters.");
            return;
        }

        // Pick a random starting index within the word
        const startIndex = Math.floor(Math.random() * (randomWord.length - 1));

        // Extract the substring of two adjacent letters
        const randomLetters = randomWord.substring(startIndex, startIndex + 2);
        socket.to(room).emit('receiveLetters', randomLetters); // Emit random word and letters
        socket.emit('receiveLetters', randomLetters);
    });
}

export function checkCorrectGuess(socket) {
    socket.on('getLetters', (room, words) => {

        // Pick a random word from the array
        const randomWord = words[Math.floor(Math.random() * words.length)];

        // Ensure the word has at least two characters
        if (randomWord.length < 2) {
            console.error("Word is too short to select letters.");
            return;
        }

        // Pick a random starting index within the word
        const startIndex = Math.floor(Math.random() * (randomWord.length - 1));

        // Extract the substring of two adjacent letters
        const randomLetters = randomWord.substring(startIndex, startIndex + 2);
        socket.to(room).emit('receiveLetters', randomLetters); // Emit random word and letters
        socket.emit('receiveLetters', randomLetters);
    });
}


export function onNextPlayerTurn(socket) {
    socket.on('nextPlayer', (room, currentMainPlayer) => {
        socket.to(room).emit('getNextPlayer', userMethods.nextPlayerTurn(room, currentMainPlayer)); // Emit message with username
    });
}

export const socketMethods = {
    onJoinRoom,
    onUserDisconnect,
    onChatMessage,
    onPlayerReady,
    onPlayerNotReady,
    onJoinOrLeaveMsg,
    onPickRandomPlayer,
    clientSideTimerUpdate,
    getLetters

}