import GameMode from "../models/gameSettingsModel.js";

function _getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function _getRandomWordFromArray(words) {
    return  words[_getRandomInt(words.length)];
}

function _getTwoLettersFromWord(word) {
    let randomNumber = _getRandomInt(word.length - 2)
    return word[randomNumber] + word[randomNumber + 1]
}


async function _fetchGameModeSettings(name) {
    return await GameMode.findOne({name: name});
}

async function  StartGame(GameName) {
    const GameSettings = await _fetchGameModeSettings(GameName);
    return _getTwoLettersFromWord(_getRandomWordFromArray(GameSettings.words))
}

async function doesWordExist(GameName,word)
{
    const GameSettings = await _fetchGameModeSettings(GameName);
    return GameSettings.words.includes(word);

}


export const gameModeMethods = {
    StartGame,
    doesWordExist,

}