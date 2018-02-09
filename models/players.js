var fs = require('fs');
var Constants = require('./constants');
var Clans = require('./clans');
var Utils = require('../utils');

var request = require('request');
var moment = require('moment');

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
    getPlayer: function (id, clanId) {
        return players[id] ? players[id][clanId] : null;
    },
    setPoints: function (id, clanId, points) {
        if (!players[id] ) {
            players[id] = {
                id: id
            }
        }
        if (!players[id][clanId]) {
            players[id][clanId] = { 
                id: id
            };
        }
        players[id][clanId].points = points;
        save();
    },
    setActiveRank: function(guildMember, rank) {
        if (!players[guildMember.id]) {
            players[guildMember.id] = {
                id: guildMember.id
            }
        }
        var clanId = Clans.getPlayerClan(guildMember).id;
        if (!players[guildMember.id][clanId]) {
            players[guildMember.id][clanId] = {
                id: id
            };
        }
        players[guildMember.id][clanId].activeRank = {
            name: rank.name,
            displayName: rank.name
        };
        save();
        if (Constants.pseudoModifier !== 'no') {
            var nickname = Utils.replaceModifier(
                Constants.pseudoModifier,
                Clans.getPlayerClan(guildMember),
                guildMember,
                players[guildMember.id][clanId],
                rank,
                false
            );
            if (nickname.length > 32) {
                nickname = nickname.substr(0, 32);
            }
            return guildMember.setNickname(nickname);
        }
    },
    setDisplayRank: function(guildMember, rank, displayName) {
        clanId = Clans.getPlayerClan(guildMember).id;
        if (!players[guildMember.id] || !players[guildMember.id][clanId]) {
            return;
        }
        players[guildMember.id][clanId].activeRank.displayName = displayName;
        save();
        if (Constants.pseudoModifier !== 'no') {
            var nickname = Utils.replaceModifier(
                Constants.pseudoModifier,
                Clans.getPlayerClan(guildMember),
                guildMember,
                players[guildMember.id][clanId],
                rank,
                false
            );
            if (nickname.length > 32) {
                nickname = nickname.substr(0, 32);
            }
            return guildMember.setNickname(nickname);
        }
    },
    resetRank: function(guildMember) {
        clanId = Clans.getPlayerClan(guildMember);
        if (!players[guildMember.id] || !players[guildMember.id][clanId]) {
            return;
        }
        players[guildMember.id][clanId].activeRank = null;
        save();
        if (Constants.pseudoModifier !== 'no') {
            if (nickname.length > 32) {
                nickname = nickname.substr(0, 32);
            }
            return guildMember.setNickname(guildMember.user.username);
        }
    },
    getPlayers: function() {
        return players;
    },
    setBtag: function(id, btag) {
        return new Promise((resolve, reject) => {
            if (!players[id]) {
                players[id] = {
                    id
                }
            }
            players[id].btag = btag;
            save();
            console.log(`https://owapi.net/api/v3/u/${ btag.replace('#', '-') }/blob`);
            request({
                url: `https://owapi.net/api/v3/u/${ btag.replace('#', '-') }/blob`,
                headers: {
                    'User-Agent': 'the cavalry discord bot'
                }
            },  (error, response, body) => {
                if (error) {
                    reject();
                    return;
                }
                var result = JSON.parse(body);
                if (!result.eu || !result.eu.stats || !result.eu.stats) {
                    reject();

                }
                if (result.eu && result.eu.stats && result.eu.stats.competitive && result.eu.stats.competitive.overall_stats && result.eu.stats.competitive.overall_stats.comprank) {
                    players[id].comprank = result.eu.stats.competitive.overall_stats.comprank;
                    players[id].lastUpdate = new Date();
                    save();
                }
                resolve(players[id].comprank);
            });
        });
    },
    getBtag: function(id) {
        return players[id].btag
    },
    setPsn: function(id, psn) {
        return new Promise((resolve, reject) => {
            if (!players[id]) {
                players[id] = {
                    id
                }
            }
            players[id].psn = psn;
            save();
            request({
                url: `https://owapi.net/api/v3/u/${ psn }/blob?platform=psn`,
                headers: {
                    'User-Agent': 'the cavalry discord bot'
                }
            },  (error, response, body) => {
                if (error) {
                    console.log(error);
                    reject();
                    return;
                }
                var result = JSON.parse(body);
                if (result.any && result.any.stats && result.any.stats.competitive && result.any.stats.competitive.overall_stats && result.any.stats.competitive.overall_stats.comprank) {
                    players[id].psncomprank = result.any.stats.competitive.overall_stats.comprank;
                    players[id].lastUpdate = new Date();
                    save();
                } else {
                    console.log(result);
                    reject();
                }
                resolve(players[id].psncomprank);
            });
        });
    },
    getPsn: function(id) {
        return players[id].psn
    },
    getComprank: function(id) {
        if (!players[id].comprank) {
            return null;
        }
        var btag = players[id].btag;
        request({
            url: `https://owapi.net/api/v3/u/${ btag.replace('#', '-') }/blob`,
            headers: {
                'User-Agent': 'the cavalry discord bot'
            }
        }, function (error, response, body) {
            if (error) {
                return;
            }
            var result = JSON.parse(body);
            if (result.eu && result.eu.stats && result.eu.stats.competitive && result.eu.stats.competitive.overall_stats && result.eu.stats.competitive.overall_stats.comprank) {
                players[id].comprank = result.eu.stats.competitive.overall_stats.comprank;
                players[id].lastUpdate = new Date();
                save();
            }
        });
        moment.locale('fr');
        var diff = moment.duration(moment().diff(players[id].lastUpdate)).humanize();
        return players[id].comprank + ` (il y a ${diff})`;
    },
    getPsnComprank: function(id) {
        if (!players[id].psncomprank) {
            return null;
        }
        var psn = players[id].psn;
        request({
            url: `https://owapi.net/api/v3/u/${ psn }/blob?platform=psn`,
            headers: {
                'User-Agent': 'the cavalry discord bot'
            }
        }, function (error, response, body) {
            if (error) {
                return;
            }
            var result = JSON.parse(body);
            if (result.any && result.any.stats && result.any.stats.competitive && result.any.stats.competitive.overall_stats && result.any.stats.competitive.overall_stats.comprank) {
                players[id].psncomprank = result.any.stats.competitive.overall_stats.comprank;
                players[id].lastUpdate = new Date();
                save();
            }
        });
        moment.locale('fr');
        var diff = moment.duration(moment().diff(players[id].lastUpdate)).humanize();
        return players[id].psncomprank + ` (il y a ${diff})`;
    },
    setTempClanToJoin: function(id, clan, code) {
        if (!players[id] ) {
            players[id] = {
                id: id
            }
        }
        players[id].tempCode = code;
        players[id].tempGuild = clan;
        save();
    }
}