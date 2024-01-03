import User from '../models/userModel.js';
import bcrypt from 'bcrypt'
import {createHash} from "crypto";


function generateHash(string) {
    return bcrypt.hashSync(string, bcrypt.genSaltSync(10));
}

function _excludeProperties() {
    return true;
}

async function _comparePasswords(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword);
}

async function checkCredentials(username, password) {
    const user = await User.findOne({username: username})
    if (!user) {
        return null;
    }
    return await _comparePasswords(password, user.password) ? _excludeProperties() : false;
}

async function fetchData(username) {
    return User.findOne({username: username});
}

export const userMethods = {
    checkCredentials,
    generateHash,
    fetchData
}