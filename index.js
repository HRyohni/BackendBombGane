import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import User from './models/userModel.js';
import GameMode from './models/gameSettingsModel.js';
import {userMethods} from './handelers/userHandler.js';
import {gameModeMethods} from './handelers/GameModeHandler.js';
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
app.use(cors());

const server = http.createServer(app);
// Pass the server instance to Socket.IO
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Specify the allowed origin for WebSocket requests
        methods: ['GET', 'POST'], // Adjust with necessary methods
        allowedHeaders: ['Authorization'], // Adjust with necessary headers
        credentials: true, // Enable credentials if required (e.g., for sending cookies)
    },
});
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('startGame', async (arg) => {
        try {
            // Assuming gameModeMethods.StartGame("colors") returns the required data for the game
            const lettersData = await gameModeMethods.StartGame("colors");

            // Emitting the 'letters' event to the client with the received data
            socket.emit("letters", lettersData);

            // Sending data along with the 'test' event to the client
            socket.emit("test", { message: "This is a test message from the server." });
        } catch (error) {
            console.error("Error starting the game:", error);
        }
    });


    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
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
            console.log(await userMethods.fetchData(username));
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


//console.log(await gameModeMethods.StartGame("colors"));
console.log(await gameModeMethods.doesWordExist("colors", "red"));


server.listen(port, () => {
    console.log(`Service running on port ${port}`);
});
