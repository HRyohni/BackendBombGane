import { users } from "./userModel.js";
import bcrypt from 'bcrypt'

function _excludeProperties(obj, excludedProps) {
    const { [excludedProps]: _, ...result } = obj;
    return result;
  }

async function _comparePasswords(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword); 
}

async function generateHash() {
    const randomData = crypto.randomBytes(32);
    const hash = crypto.createHash('sha256');
    hash.update(randomData);
    return hash.digest('hex');
}

async function checkCredentials(email, password) {
    const user = users.find(user => user.email === email);
    if(!user) {
        return null;
    }
    return _comparePasswords(password, user.password) ? _excludeProperties(user, 'password') : null; 
}

export const methods = {
    checkCredentials,
    generateHash
}