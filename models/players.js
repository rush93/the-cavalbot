var fs = require('fs');
var Constants = require('./constants');
var Clans = require('./clans');
var Utils = require('../utils');

var players = {};

function save() {
    fs.writeFile("./data/players.json", JSON.stringify(players), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile('./data/players.json', (err, data) => {
            if (err) return;
            players = JSON.parse(data);
            resolve(players);
        });
    })
}
module.exports = {
    init: function () {
        return new Promise((resolve, reject) => {
            load()
                .then(r => resolve(r))
                .catch(e => reject(e));
        });
    },
    save: function () {
        save();
    },
    setCooldown: function (guildMember) {
        if (!players[guildMember.id]) {
            players[guildMember.id] = {
                id: guildMember.id
            }
        }
        players[guildMember.id].cooldown = new Date();
        save();
    },
    getPlayer: function (id) {
        return players[id];
    },
    setPoints: function (id, points) {
        if (!players[id] ) {
            players[id] = {
                id: id
            }
        }
        players[id].points = points;
        save();
    },
    setActiveRank: function(guildMember, rank) {
        if (!players[guildMember.id]) {
            players[guildMember.id] = {
                id: guildMember.id
            }
        }
        players[guildMember.id].activeRank = {
            name: rank.name,
            displayName: rank.name
        };
        save();
        if (Constants.pseudoModifier !== 'no') {
            var nickname = Utils.replaceModifier(
                Constants.pseudoModifier,
                Clans.getPlayerClan(guildMember),
                guildMember,
                players[guildMember.id],
                rank,
                false
            );
            return guildMember.setNickname(nickname);
        }
    },
    setDisplayRank: function(guildMember, rank, displayName) {
        if (!players[guildMember.id]) {
            return;
        }
        players[guildMember.id].activeRank.displayName = displayName;
        save();
        if (Constants.pseudoModifier !== 'no') {
            var nickname = Utils.replaceModifier(
                Constants.pseudoModifier,
                Clans.getPlayerClan(guildMember),
                guildMember,
                players[guildMember.id],
                rank,
                false
            );
            return guildMember.setNickname(nickname);
        }
    },
    resetRank: function(guildMember) {
        if (!players[guildMember.id]) {
            return;
        }
        players[guildMember.id].activeRank = null;
        save();
        if (Constants.pseudoModifier !== 'no') {
            return guildMember.setNickname(guildMember.user.username);
        }
    },
    getPlayers: function() {
        return players;
    }
}