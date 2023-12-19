import dotenv from 'dotenv';
dotenv.config({ path: `./.env` });

import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import User from './models/userModel.js';
import UserModel from "./models/userModel.js";
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;
const jwtKey = process.env.JWT_SECRET_KEY;

mongoose.connect(process.env.MONGO_URI).then(r => console.log("connected to mongo")).catch((e)=>{
    console.log(e);})
app.use(cors({exposedHeaders: ['authenticated-user']}));
app.use(express.json());
app.use('/api', router);

// add route here
// use await methods.checkCredentials(userData.email, userData.password); for credentials check
router
    .route("/movie")
    .get((req, res) => {

        console.log("fuk it");
        res.json("fuck off2");
    })
// Get All data
router
    .route("/getUsers")
    .get(async (req, res) => {
        console.log(await User.find());
        res.json("wow");
    })

//login
app.post('/api/login', (req, res) => {
    console.log(req.body)

    res.status(200).json({result: req.body.text});
})

// Register
app.post('/api/register', async (req, res) => {

    try {

        const {username, mail, password} = req.body
        if (!mail) {
            return res.status(400).json({ error: 'Email is required' });
        }
        console.log(req.body);
        const user = new User({username: username, mail: mail, password: password});
        await user.save().then((e) => console.log("saved"));

    } catch (e) {
        console.log(e);
    }

    res.status(200).json({result: req.body.text});
})


app.listen(port, () => {
    console.log(`Service running on port ${port}`);
});
