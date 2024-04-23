import User from '../models/userModel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Access the JWT secret key
const jwtSecret = process.env.JWT_SECRET;

function generateToken(username, password) {
    return jwt.sign({ username, password }, jwtSecret, { expiresIn: '1h' });
}


function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, jwtSecret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        // If everything is good, save to request for use in other routes
        req.username = decoded.username;
        next();
    });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // No token provided

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token is invalid
        req.user = user;
        next(); // Token is valid, proceed to the next middleware or route handler
    });
}

function generateHash(string) {
    return bcrypt.hashSync(string, bcrypt.genSaltSync(10));
}

function _excludeProperties() {
    return true;
}

async function _comparePasswords(password, hashPassword) {
    const result = await bcrypt.compare(password, hashPassword);
    return result;
}

async function checkCredentials(username, password) {
    const user = await User.findOne({ username });

    if (!user) {
        console.log("User not found");
        return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        console.log("Invalid password");
        return null;
    }

    return user;
}



async function fetchData(username) {
    return User.findOne({username: username});
}

async function updateUser(username, newData) {
    try {
        return await User.findOneAndUpdate({username: username}, newData, {new: true});
    } catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
}

async function updateUserMoney(username, moneyToAdd) {
    try {
        const user = await fetchData(username);
        if (!user) {
            console.error("User not found");
            return null;
        }

        // Calculate the new money and scoreboard values
        const newMoney = user.money + moneyToAdd;
        const newScoreboard = user.scoreboard + moneyToAdd; // Assuming scoreboard is same as money

        // Update the user's money and scoreboard fields with the new values
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: { money: newMoney, scoreboard: newScoreboard } },
            { new: true }
        );
        console.log("Updated user's money:", updatedUser.money);
        console.log("Updated user's scoreboard:", updatedUser.scoreboard);
        return updatedUser;
    } catch (error) {
        console.error("Error updating user's money and scoreboard:", error);
        return null;
    }
}



async function updateUserProfilePicture(username, newPicture) {
    try {
        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: { profilePicture: newPicture } },
            { new: true }
        );
        console.log(username, newPicture);
        console.log(user);
        return user;
    } catch (error) {
        console.error("Error updating user's profile picture:", error);
        return null;
    }
}



async function getUserMoney(username) {
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            console.error("User not found");
            return null;
        }
        return user.money;
    } catch (error) {
        console.error("Error getting user's money:", error);
        return null;
    }
}

async function updateUserConfettiColor(username, newColor) {
    try {
        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: { confettiColor: newColor } },
            { new: true }
        );
        console.log(user);
        return user;
    } catch (error) {
        console.error("Error updating user's confetti color:", error);
        return null;
    }
}

async function updateUserBackgroundColor(username, newColor) {
    try {
        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: { victoryBackground: newColor } },
            { new: true }
        );
        console.log(user);
        return user;
    } catch (error) {
        console.error("Error updating user's background color:", error);
        return null;
    }
}



async function fetchAllUsers() {
    try {
        const users = await User.find({});
        return users;
    } catch (error) {
        console.error("Error fetching all users:", error);
        return null;
    }
}








export const userMethods = {
    checkCredentials,
    generateToken,
    generateHash,
    fetchData,
    updateUser,
    updateUserMoney,
    getUserMoney,
    updateUserProfilePicture,
    updateUserConfettiColor,
    updateUserBackgroundColor,
    verifyToken,
    authenticateToken,
    fetchAllUsers,

}