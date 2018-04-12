var fs = require('fs');
var Constants = require('./constants');
var Utils = require('../utils');

var chatInteractions = {};
var reactInteractions = {};

function saveChat() {
    fs.writeFile(__dirname + "/../data/chatInteractions.json", JSON.stringify(chatInteractions), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}chatInteractions${Utils.Color.Reset} file was saved!`);
    });
}

function saveReaction() {
    fs.writeFile(__dirname + "/../data/reactInteractions.json", JSON.stringify(reactInteractions), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}reactInteractions${Utils.Color.Reset} file was saved!`);
    });
}

function loadChat() {
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../data/chatInteractions.json', (err, data) => {
            if (err) return;
            chatInteractions = JSON.parse(data);
            resolve(chatInteractions);
        });
    })
}

function loadReact() {
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../data/reactInteractions.json', (err, data) => {
            if (err) return;
            reactInteractions = JSON.parse(data);
            resolve(reactInteractions);
        });
    })
}

module.exports = {
    init: function () {
        return new Promise((resolve, reject) => {
            loadChat()
                .then(r => resolve(r))
                .catch(e => reject(e));
            loadReact();
        });
    },
    save: function () {
        saveChat();
        saveReaction();
    },
    addChatInteractions: function (command, functionToCall, userID, channelId = null,additionalArg = null) {
        chatInteractions[userID] = { command, functionToCall, channelId, additionalArg };
        saveChat();
    },
    addReactInteractions: function (command, functionToCall, messageId, userId = null, additionalArg = null) {
        if (!messageId) {
            reactInteractions[userId] = { command, functionToCall, additionalArg };
        } else {
            reactInteractions[messageId] = { command, functionToCall, additionalArg, userId };
        }
        saveReaction();
    },
    delChatInteractions: function (userId) {
        delete chatInteractions[userId];
        saveChat();
    },
    delReactInteractions: function (id) {
        delete reactInteractions[id];
        saveReaction();
    },
    getChatInteraction: function (userID, channelId = null) {
        var interaction = chatInteractions[userID];
        if(!interaction) {
            return null;
        }
        if (!channelId && !interaction.channelId) {
            return interaction;
        }
        if (channelId === interaction.channelId) {
            return interaction;
        }
        return null;
    },
    getReactInteraction: function (id) {
        return reactInteractions[id];
    }
}