import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';

import roomDB from "./models/roomModel.js";
import User from './models/userModel.js';
import GameMode from './models/gameSettingsModel.js';
import {userMethods} from './handelers/userHandler.js';
import {gameModeMethods} from './handelers/GameModeHandler.js';
import {roomMethods} from './handelers/RoomHandeler.js';
import {
    changeConfetti,
    changeProfilePicture,
    fetchUserData,
    getUserMoney,
    socketMethods,
    wasteMoney
} from './handelers/socketHandlers.js';

const JWT_SECRET_KEY = 'your-secret-key';



import http from 'http';
import {Server} from 'socket.io';

import cors from "cors";


const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

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
    origin: ["https://thebombgame.netlify.app","http://127.0.0.1:5173/"], // Replace with the appropriate origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://thebombgame.netlify.app","http://127.0.0.1:5173/"], // Specify the allowed origin for WebSocket requests
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
    socketMethods.onLooseLife(socket);
    socketMethods.onPlayerWin(socket);
    socketMethods.onNextPlayerTurn(socket);
    socketMethods.testConnection(socket);
    socketMethods.onDisconnect(socket);
    socketMethods.onPointsReceived(socket);
    socketMethods.saveScore(socket);
    socketMethods.getUserMoney(socket);
    socketMethods.changeProfilePicture(socket);
    socketMethods.wasteMoney(socket);
    socketMethods.fetchUserData(socket);
    socketMethods.changeConfetti(socket);
});


app.post('/api/register', async (req, res) => {
    try {
        let {username, mail, password, profilePicture} = req.body;
        if (!mail) {
            return res.status(400).json({error: 'Email is required'});
        }
        const user = new User({
            username: username,
            mail: mail,
            password: userMethods.generateHash(password),
            profilePicture: profilePicture,
            confettiColor: "yellow",
            victoryBackground: "white",
            money: 0,
            scoreboard: 0,
        });
        await user.save();
        return res.status(200).json({result: true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({result: false, error: 'Internal server error'});
    }
});

app.post('/api/login', async (req, res) => {
    try {

        const { username, password } = req.body;
        const user = await userMethods.checkCredentials(username, password);
        if (user) {
            const token = userMethods.generateToken(username , password);
            res.json({ token, user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
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

app.get('/api/user/profilePicture/:username', async (req, res) => {
    try {

        const username = req.params.username;
        const user = await userMethods.fetchData(username);
        res.status(200).json(user.profilePicture);
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(200).json({profilePictureUrl: "https://cdn.discordapp.com/attachments/902618947759788043/1226461549258866718/img3.png?ex=6624da53&is=66126553&hm=0b4702e4d72eb1e2a9617856f2d6e90013a2eb7176dc88929214be3925cff64c&\n"});
    }
});

app.get('/api/user/fetchAllUsers', async (req, res) => {
    try {
        const user = await userMethods.fetchAllUsers();
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(200).json({profilePictureUrl: "https://cdn.discordapp.com/attachments/902618947759788043/1226461549258866718/img3.png?ex=6624da53&is=66126553&hm=0b4702e4d72eb1e2a9617856f2d6e90013a2eb7176dc88929214be3925cff64c&\n"});
    }
});


// # Gamemodes
// adding new gamemodes for later
app.post('/api/gamemode/add-gamemode', async (req, res) => {
    let {name, words, description, Author} = req.body;

    const gameMode = new GameMode({name: name, words: words, description: description, Author: Author});
    await gameMode.save();
    res.send('new Gamemode Saved')
})

app.get('/api/gamemode/fetch-gamemodes', async (req, res) => {
    try {
        res.status(200).json(await gameModeMethods.fetchGamemodes())
    } catch (error) {
        res.status(500);
    }
})

app.get('/api/gameMode/:gameModeId', async (req, res) => {
    try {
        const name = req.params;
        const gameMode = await GameMode.findOne({name: name});
        res.status(200).send(gameMode);
    } catch (error) {
        console.log(error);
        return res.status(500).json({result: false, error: 'Internal server error'});
    }
});

// # Rooms
app.post('/api/room/create-room', async (req, res) => {
    console.log(req.body);
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
    const {roomID, data} = await req.body;
    res.status(200).send(await roomMethods.updateRoomById(roomID, data));
})


server.listen(port, () => {
    console.log(`Service running on port ${port}`);
});



