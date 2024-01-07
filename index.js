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


// Array to store users
const users = {};


io.on('connection', (socket) => {

    // Handle new user and add to users object
    socket.on('new user', ({username, room}) => {
        console.log(username, "joined room ", room)
        socket.join(room); // Join the specified room
        socket.to(room).emit('user joined', username); // Emit to users in the room
    });

    // Handle chat messages
    socket.on('chat message', ({message, username, room}) => {
        io.to(room).emit('chat message', {message, username}); // Emit message with username
    });

    socket.on('disconnect', () => {
        // Fetch rooms for the disconnected socket
        const rooms = Object.keys(socket.rooms);
        rooms.forEach((room) => {
            io.to(room).emit('user left', socket.id);
        });
    });

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

        socket.on('joinRoom', (room) => {
            socket.join(room);
            socket.emit("broadcast", "omg you have new user");
            socket.to("room1").emit("some event");
            console.log(socket.rooms);
            console.log(`User joined room: ${room}`);
        });


        socket.on('startGame', async (GameName, room) => {
            try {
                const lettersData = await gameModeMethods.StartGame(GameName);
                console.log(lettersData);
                io.to(room).emit("letters", lettersData);

            } catch (error) {

                console.error("Error starting the game:", error);
            }
        });
        socket.on('checkWord', async (GameName, word) => {
            socket.to("some room").emit("room1");
            try {
                const lettersData = await gameModeMethods.doesWordExist("colors", word);
                socket.emit("result", lettersData);
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

    server.listen(port, () => {
        console.log(`Service running on port ${port}`);
    });
