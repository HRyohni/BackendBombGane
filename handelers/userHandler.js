import User from '../models/userModel.js';
import bcrypt from 'bcrypt'

const roomData = {};

function generateHash(string) {
    return bcrypt.hashSync(string, bcrypt.genSaltSync(10));
}

function _excludeProperties() {
    return true;
}

async function _comparePasswords(password, hashPassword) {
    console.log("Input Password:", password);
    console.log("Stored Hashed Password:", hashPassword);

    const result = await bcrypt.compare(password, hashPassword);
    console.log("Password Comparison Result:", result);

    return result;
}

async function checkCredentials(username, password) {
    const user = await User.findOne({"username": username});

    if (!user) {
        console.log("can't find user!");
        return false;
    }

    return await _comparePasswords(password, user.password) ? _excludeProperties() : false;
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

async function updateUserMoney(username, newMoney) {
    try {
        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: { money: newMoney } },
            { new: true }
        );
        console.log(user);
        return user;
    } catch (error) {
        console.error("Error updating user's money:", error);
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










export const userMethods = {
    checkCredentials,
    generateHash,
    fetchData,
    updateUser,
    updateUserMoney,
    getUserMoney,
    updateUserProfilePicture,
    updateUserConfettiColor,
    updateUserBackgroundColor

}