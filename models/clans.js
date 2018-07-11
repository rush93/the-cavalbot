var fs = require('fs');
var Constants = require('./constants');
var Utils = require('../utils');
var path = require(`path`);

var clans = {};
var clansMap = {};
var clansPs4Map = {};

function save() {
    fs.writeFile(path.resolve(__dirname + '/../data/clans.json'), JSON.stringify(clans), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}clans${Utils.Color.Reset} file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + '/../data/clans.json', (err, data) => {
            if (err) return;
            clans = JSON.parse(data);
            resolve(clans);
        });
    })
}

var getRoleByName = function (name, guild) {
    if (clansMap[name]) {
        return guild.roles.get(clansMap[name]);
    }
    var role = guild.roles.find('name', name);
    if (role) {
        clansMap[role.name] = role.id;
    }
    return role;
}

module.exports = {
    init: function () {
        return new Promise((resolve, reject) => {
            load()
                .then(r => {
                    resolve(r)
                    var ids = Object.keys(clans);
                    for (var i = 0; i < ids.length; i++) {
                        if (clans[ids[i]] && clans[ids[i]].ps4Role) {
                            clansPs4Map[clans[ids[i]].ps4Role] = ids[i];
                        }
                    }
                })
                .catch(e => reject(e));
        });
    },
    save: function () {
        save();
    },
    getClan: function (guildRole) {
        if (!clans[guildRole.id] && clansPs4Map[guildRole.id]) {
            return clans[clansPs4Map[guildRole.id]];
        }
        return clans[guildRole.id];
    },
    getClanById: function (id) {
        if (!clans[id] && clansPs4Map[id]) {
            return clans[clansPs4Map[id]];
        }
        return clans[id];
    },
    createClan: function (guildRole) {
        clans[guildRole.id] = {
            id: guildRole.id
        };
        save();
    },
    getPlayerClan: function (guildMember) {
        var roles = guildMember.roles;

        var playerRole = null;
        roles.forEach((role) => {
            if (playerRole) return;
            if (clans[role.id]) {
                playerRole = role;
            } else if(clansPs4Map[role.id]) {
                playerRole = guildMember.guild.roles.get(clansPs4Map[role.id]);
            }
        });
        return playerRole;
    },
    deleteClan: function (guildRole) {
        if(clansPs4Map[clans[guildRole.id].ps4Role]) {
            delete clansPs4Map[clans[guildRole.id].ps4Role];
        }
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
    addPlayer: function (guildRole, player, reason, isPS4) {
        var roles = player.roles;

        var fail = false;
        roles.forEach((role) => {
            if (fail) return;
            var keys = Object.keys(clans);
            if (clans[role.id] || clansPs4Map[role.id]) {
                fail = true;
            }
        });
        if (!fail) {
            var GuestRole = getRoleByName('Membres', guildRole.guild);
            if (isPS4) {
                var ps4Role = guildRole.guild.roles.get(clans[guildRole.id].ps4Role);
                player.addRole(ps4Role, reason);
            } else {
                player.addRole(guildRole, reason);
            }
            if (GuestRole) {
                player.removeRole(GuestRole, reason);
            }
            if (Constants.joinmessage !== 'no' && clans[guildRole.id].channel) {
                var message = Utils.replaceModifier(Constants.joinmessage, clans[guildRole.id], player, null, null, isPS4, Constants.PS4);
                guildRole.guild.channels.get(clans[guildRole.id].channel).send(message);
            }
        }
        return fail ? null : clans[guildRole.id];
    },
    removePlayer: function (guildRole, player, reason, isPS4) {
        var fail = true;
        player.roles.forEach((role) => {
            if (!fail) return;
            if (role.id === guildRole.id || role.id === clans[guildRole.id].ps4Role) {
                fail = false;
                var GuestRole = getRoleByName('Membres', guildRole.guild);
                if (isPS4) {
                    var ps4Role = guildRole.guild.roles.get(clans[guildRole.id].ps4Role);
                    player.removeRole(ps4Role, reason);
                } else {
                    player.removeRole(guildRole, reason);
                }
                if (GuestRole) {
                    player.addRole(GuestRole, reason);
                }
                if (Constants.leavemessage !== 'no' && clans[guildRole.id].channel) {
                    var message = Utils.replaceModifier(Constants.leavemessage, clans[guildRole.id], player, null, null, isPS4, Constants.PS4);
                    guildRole.guild.channels.get(clans[guildRole.id].channel).send(message);
                }
            }
        });
        return fail ? null : clans[guildRole.id];
    },
    getRole: function (clanId, guild) {
        if (clansPs4Map[clanId]) {
            clanId = clansPs4Map[clanId];
        }
        return guild.roles.get(clanId);
    },
    setPs4Role: function (clanId, role) {
        if (!clans[clanId]) {
            return;
        }
        if (clans[clanId].ps4Role && clansPs4Map[clans[clanId].ps4Role]) {
            delete clansPs4Map[clans[clanId].ps4Role];
        }
        clans[clanId].ps4Role = role.id;
        clansPs4Map[role.id] = clanId;
        save();
    },
    getPs4Role: function (clanId) {
        if (!clans[clanId]) {
            return null;
        }
        return clans[clanId].ps4Role;
    },
    getRoleByName,
    get clans() {
        return clans;
    },
    setSeasonPoints: function (ClanId, points, season, withoutSave = false) {
        if (!clans[ClanId]) {
            return;
        }
        if (!clans[ClanId].seasons) {
            clans[ClanId].seasons = {};
        }
        clans[ClanId].seasons[season] = points;
        if(!withoutSave) {
            save();
        }
    },
    getPointsOfLastSeason: function (ClanId) {
        if(!Constants.season || Constants.season < 0) {
            return null;
        }
        if(!clans[ClanId]) {
            return null;
        }
        return clans[ClanId].seasons[Constants.season];
    }
}