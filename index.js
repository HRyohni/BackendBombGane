import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';

import roomDB from "./models/roomModel.js";
import User from './models/userModel.js';
import GameMode from './models/gameSettingsModel.js';


import {userMethods} from './handelers/userHandler.js';
import {gameModeMethods} from './handelers/GameModeHandler.js';
import {roomMethods} from './handelers/RoomHandeler.js';
import {
    clientSideTimerUpdate, getLetters,
    onChatMessage, onCheckCorrectWord, onDisconnect,
    onJoinOrLeaveMsg, onNextPlayerTurn,
    onPickRandomPlayer,
    onPlayerReady, onResetTimer,
    socketMethods, testConnection
} from './handelers/socketHandlers.js';


import http from 'http';
import {Server} from 'socket.io';

import cors from "cors";


const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;
const jwtKey = process.env.JWT_SECRET_KEY;
dotenv.config({path: `./.env`});

mongoose
    .connect(process.env.MONGO_URI)
    .then((r) => console.log('connected to mongo'))
    .catch((e) => {
        console.log(e);
    });


app.use(express.json());
app.use('/api', router);
app.use(cors({
    origin: 'http://127.0.0.1:3000', // Replace with the appropriate origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://127.0.0.1:5173', // Specify the allowed origin for WebSocket requests
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'],
        credentials: true,
    },
});


io.on('connection', (socket) => {
    socketMethods.onJoinRoom(socket);
    socketMethods.onUserDisconnect(socket);
    socketMethods.onChatMessage(socket);
    socketMethods.onJoinOrLeaveMsg(socket);
    socketMethods.onPlayerReady(socket);
    socketMethods.onPlayerNotReady(socket);
    socketMethods.onPickRandomPlayer(socket);
    socketMethods.getLetters(socket);
    socketMethods.onCheckCorrectWord(socket);
    socketMethods.onResetTimer(socket);
    socketMethods.clientSideTimerUpdate(socket);
    socketMethods.onNextPlayerTurn(socket);
    socketMethods.testConnection(socket);
    socketMethods.onDisconnect(socket);



});


app.post('/api/register', async (req, res) => {
    try {
        const {username, mail, password} = req.body;
        if (!mail) {
            return res.status(400).json({error: 'Email is required'});
        }
        const user = new User({username: username, mail: mail, password: userMethods.generateHash(password)});
        await user.save();
        console.log('New user added!');
        return res.status(200).json({result: true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({result: false, error: 'Internal server error'});
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        if (await userMethods.checkCredentials(username, password)) {
            res.status(200).json({result: await userMethods.fetchData(username)});
        }
        res.status(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({result: false, error: 'Internal server error'});
    }
});

app.post('/api/fetchUser', async (req, res) => {
    try {
        const {username, password} = req.body;
        if (await userMethods.checkCredentials(username, password)) {
            res.status(200).json({result: await userMethods.fetchData(username)});
        }
        res.status(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({result: false, error: 'Internal server error'});
    }
});


// # Gamemodes
// adding new gamemodes for later
app.post('/api/add-gamemode', async (req, res) => {
    const gameMode = new GameMode({name: "colors", words: ["red", "yellow", "green", "black", "white", "orange"]});
    await gameMode.save();
    res.send('new Gamemode Saved')
})

app.get('/api/gameMode/:gameModeId', async (req, res) => {
    try {
        const name = req.params;
        const gameMode = await GameMode.findOne({name: "colors"});
        res.status(200).send(gameMode);
    } catch (error) {
        console.log(error);
        return res.status(500).json({result: false, error: 'Internal server error'});
    }
});

// # Rooms
app.post('/api/room/create-room', async (req, res) => {
    res.status(200).send(roomMethods.createRoom(req.body))
})

app.get('/api/room/fetch-rooms', async (req, res) => {
    try {
        res.status(200).json(await roomMethods.fetchRooms())
    } catch (error) {
        res.status(500);
    }
});

app.get('/api/room/fetch-room/:roomID', async (req, res) => {
    try {
        const roomID = req.params.roomID;
        res.status(200).json(await roomMethods.fetchRoomByID(roomID))
    } catch (error) {
        res.status(500);
    }
});

 app.post('/api/room/update-room', async (req, res) => {
    const {roomID , data} = await req.body;
    res.status(200).send(await roomMethods.updateRoomById(roomID,data));
})



server.listen(port, () => {
    console.log(`Service running on port ${port}`);
});



