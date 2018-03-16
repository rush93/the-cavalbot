var fs = require('fs');
var Constants = require('./constants');
var Clans = require('./clans');
var Players = require('./players');
var Utils = require('../utils');

var ranks = {};

function save() {
    fs.writeFile(__dirname + "/../data/ranks.json", JSON.stringify(ranks), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}ranks${Utils.Color.Reset} file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../data/ranks.json', (err, data) => {
            if (err) return;
            ranks = JSON.parse(data);
            resolve(ranks);
        });
    })
}

var getSortedKeys = function (clanId) {
    var clanRanks = ranks[clanId];
    if (!clanRanks) return [];
    return Object.keys(clanRanks).sort(function (a, b) {
        return clanRanks[a].points - clanRanks[b].points
    });
};
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
    create: function (clanId, name) {
        if (!ranks[clanId]) {
            ranks[clanId] = {};
        }
        ranks[clanId][name] = { name, clanId };
        save();
    },
    delete: function (clanId, name) {
        if (!ranks[clanId])
            return false;
        delete ranks[clanId][name];
        save();
        return true;
    },
    getRank: function (clanId, name) {
        if (!ranks[clanId])
            return null;
        return ranks[clanId][name];
    },
    getRanks: function (clanId) {
        return ranks[clanId];
    },
    getRankOfPlayer: function (guildMember) {
        var clan = Clans.getPlayerClan(guildMember);
        if (!clan) return [];
        var sortedRanks = getSortedKeys(clan.id);
        (guildMember.id);
        var player = Players.getPlayer(guildMember.id, clan.id);
        if (!player) {
            return [];
        }
        var playerRanks = [];
        for (var i = 0; i < sortedRanks.length; i++) {
            if (ranks[clan.id][sortedRanks[i]].points > player.points) {
                break;
            }
            playerRanks.push(ranks[clan.id][sortedRanks[i]]);
        }
        return playerRanks;
    },
    getSortedKeys,
    setPoints: function (clanId, name, points) {
        if (!ranks[clanId]) {
            return false;
        }
        ranks[clanId][name].points = points;
        save();
        return true;
    },
    setSmiley: function (clanId, name, smiley) {
        if (!ranks[clanId]) {
            return false;
        }
        ranks[clanId][name].smiley = smiley;
        save();
        return true;
    },
    setIsCustomable: function (clanId, name, isCustomable) {
        if (!ranks[clanId]) {
            return false;
        }
        ranks[clanId][name].isCustomable = isCustomable;
        save();
        return true;
    },
    setRole: function (clanId, name, GuildRole) {
        if (!ranks[clanId]) {
            return false;
        }
        ranks[clanId][name].roleId = GuildRole.id;
        save();
        return true;
    }
}