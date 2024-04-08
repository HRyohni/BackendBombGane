import {userMethods} from "./userHandler.js";
import {gameModeMethods} from "./GameModeHandler.js";
import {roomMethods} from "./RoomHandeler.js";
import * as trace_events from "trace_events";

const rooms = {};


function _getNextPlayer(currentPlayerName, players) {
    const currentIndex = players.findIndex(player => player === currentPlayerName);
    if (currentIndex === -1) {
        return null;
    } else {
        // Calculate the index of the next player
        if (currentIndex + 1 < players.length) {
            return players[currentIndex + 1];
        } else {
            return players[0];
        }
    }
}

export function onJoinRoom(socket) {
    socket.on('joinRoom', (roomName, playerName) => {
        // Create room if it doesn't exist
        if (!rooms[roomName]) {
            rooms[roomName] = {sockets: new Set(), playersName: []};
        } else {
            // Check if the player is already in the room
            if (rooms[roomName].playersName.includes(playerName)) {
                // Player is already in the room, so skip adding them again
                console.log(`${playerName} is already in the room ${roomName}`);
                return;
            }
        }

        // Add the socket to the room
        socket.join(roomName);
        rooms[roomName].sockets.add(socket.id);
        rooms[roomName].playersName.push(playerName);
        console.log(socket.adapter.rooms.get(roomName));
        console.log("rooms");
        console.log(rooms);
        socket.to(roomName).emit('newPlayerJoined', playerName);
    });
}


export function onUserDisconnect(socket) {
    socket.on('disconnectUserFromRoom', (roomName, userName) => {
        if (rooms.hasOwnProperty(roomName)) {
            // Leave the room
            socket.leave(roomName);

            // Remove the socket from the room's sockets set
            rooms[roomName].sockets.delete(socket.id);

            // Remove the user from the room's playersName array
            const index = rooms[roomName].playersName.indexOf(userName);
            if (index !== -1) {
                rooms[roomName].playersName.splice(index, 1);
            }

            // Call any other relevant functions to handle user removal
            roomMethods.removePlayerFromRoom(roomName, userName);

            // Emit event to notify other users in the room
            socket.to(roomName).emit("playerLeftParty");

            // Log updated room information
            console.log(`Room ${roomName} after user disconnect:`, rooms[roomName]);
        }
    });
}

export function onChatMessage(socket) {
    socket.on('sendMessage', ({message, username, room}) => {
        socket.to(room).emit('newMessage', username, message);
    });
}

export function onPlayerWin(socket) {
    socket.on('onPlayerWin', (roomId, playersName) => {
        socket.to(roomId).emit('fetchPlayerWin', playersName);
        socket.emit('fetchPlayerWin', playersName);
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
        socket.to(room).emit('timerGetUpdate', timer);
    });
}

export function onResetTimer(socket) {
    socket.on('resetTimer', (room) => {
        console.log("reset timer")
        socket.to(room).emit('getResetTimer');
        socket.emit('getResetTimer');
    });
}

export function getLetters(socket) {
    socket.on('getLetters', (room, words) => {

        // Pick a random word from the array
        console.log("error is here");
        console.log(words);
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

export async function onCheckCorrectWord(socket) {
    socket.on('checkCorrectWord', async (room, word, gamemodeName) => {

        if (await gameModeMethods.doesWordExist(gamemodeName, word) === true) {
            await socket.to(room).emit('isWordCorrect', true);
            await socket.emit('isWordCorrect', true);
        } else {
            await socket.to(room).emit('isWordCorrect', false);
            await socket.emit('isWordCorrect', false);
        }

    });
}

export async function onLooseLife(socket) {
    socket.on('onLooseLife', async (room, player, playerHp) => {
        await socket.to(room).emit('getLifeInfo', player, playerHp);
        await socket.emit('getLifeInfo', player, playerHp);
    });
}


export function onNextPlayerTurn(socket) {
    socket.on('nextPlayer', (room, currentPlayer, allPlayers) => {
        let nextPlayer = _getNextPlayer(currentPlayer, allPlayers)

        socket.emit('getNextPlayer', nextPlayer);
        socket.to(room).emit('getNextPlayer', nextPlayer);
    });
}

export function testConnection(socket) {
    socket.on('sendTest', (room) => {
        socket.to(room).emit('getTestConnection');
    });
}

export function onPointsReceived(socket) {
    socket.on('onPointsReceived', (room, username, points) => {
        socket.emit('fetchScore', username, points);
        socket.to(room).emit('fetchScore', username, points);
    });
}

export function onDisconnect(socket) {
    socket.on('disconnect', () => {
        // Find the room where this socket is
        let roomName;
        for (const [name, room] of Object.entries(rooms)) {
            if (room.sockets.has(socket.id)) {
                roomName = name;
                break;
            }
        }

        // If the socket was in a room, remove it
        if (roomName) {
            rooms[roomName].sockets.delete(socket.id);

        }
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
    getLetters,
    onCheckCorrectWord,
    onNextPlayerTurn,
    onResetTimer,
    testConnection,
    onDisconnect,
    onLooseLife,
    onPlayerWin,
    onPointsReceived

}