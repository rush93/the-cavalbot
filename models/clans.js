var fs = require('fs');
var Constants = require('./constants');
var Utils = require('../utils');

var clans = {};

function save() {
    fs.writeFile("./data/clans.json", JSON.stringify(clans), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile('./data/clans.json', (err, data) => {
            if (err) return;
            clans = JSON.parse(data);
            resolve(clans);
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
    getClan: function (guildRole) {
        return clans[guildRole.id];
    },
    getClanById: function (id) {
        return clans[id];
    },
    createClan: function (guildRole) {
        clans[guildRole.id] = {
            id: guildRole.id
        };
        save();
    },
    getPlayerClan: function(guildMember) {
        var roles = guildMember.roles;

        var playerRole = null;
        roles.forEach((role) => {
            if (playerRole) return;
            var keys = Object.keys(clans);
            for (var i = 0; i < keys.length; i++) {
                if (role.id === keys[i]) {
                    playerRole = clans[keys[i]];
                }
            }
        });
        return playerRole;
    },
    deleteClan: function (guildRole) {
        delete clans[guildRole.id];
        save();
    },
    setDescription: function (guildRole, description) {
        clans[guildRole.id].description = description;
        save();
    },
    setImage: function (guildRole, image) {
        clans[guildRole.id].image = image;
        save();
    },
    setSmiley: function (guildRole, smiley) {
        clans[guildRole.id].smiley = smiley;
        save();
    },
    setChannel: function (guildRole, channel) {
        clans[guildRole.id].channel = channel.id;
        save();
    },
    addPlayer: function (guildRole, player, reason) {
        var roles = player.roles;

        var fail = false;
        roles.forEach((role) => {
            if (fail) return;
            var keys = Object.keys(clans);
            for (var i = 0; i < keys.length; i++) {
                if (role.id === keys[i]) {
                    fail = true;
                }
            }
        });
        if (!fail) {
            player.addRole(guildRole, reason);
            if (Constants.joinmessage !== 'no' && clans[guildRole.id].channel) {
                var message = Utils.replaceModifier(Constants.joinmessage, clans[guildRole.id], player, null, null);
                guildRole.guild.channels.get(clans[guildRole.id].channel).send(message);
            }
        }
        return fail ? null : clans[guildRole.id];
    },
    removePlayer: function (guildRole, player, reason) {
        var fail = true;
        player.roles.forEach((role) => {
            if (!fail) return;
            if(role.id === guildRole.id) {
                fail = false;
                player.removeRole(guildRole, reason);
                if (Constants.leavemessage !== 'no' && clans[guildRole.id].channel) {
                    var message = Utils.replaceModifier(Constants.leavemessage, clans[guildRole.id],player ,null, null);
                    guildRole.guild.channels.get(clans[guildRole.id].channel).send(message);
                }
            }
        });
        return fail ? null : clans[guildRole.id];
    },
    getRole: function (clanId, guild) {
        return guild.roles.get(clanId);
    },
    get clans() {
        return clans;
    }
}