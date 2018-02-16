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

function createUserIfNotExist(id) {
    if (!players[id]) {
        players[id] = {
            id: id,
            clans: {},
            btags: {},
            psns: {}
        }
    }
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
        createUserIfNotExist(guildMember.id);
        players[guildMember.id].cooldown = new Date();
        save();
    },
    getPlayer: function (id, clanId) {
        return players[id] ? players[id].clans[clanId] : null;
    },
    setPoints: function (id, clanId, points) {
        createUserIfNotExist(id);
        if (!players[id].clans[clanId]) {
            players[id].clans[clanId] = {
                id: id
            };
        }
        players[id].clans[clanId].points = points;
        save();
    },
    setActiveRank: function (guildMember, rank) {
        createUserIfNotExist(guildMember.id);
        var clanId = Clans.getPlayerClan(guildMember).id;
        if (!players[guildMember.id].clans[clanId]) {
            players[guildMember.id].clan[clanId] = {
                id: id
            };
        }
        players[guildMember.id].clans[clanId].activeRank = {
            name: rank.name,
            displayName: rank.name
        };
        save();
        if (Constants.pseudoModifier !== 'no') {
            var nickname = Utils.replaceModifier(
                Constants.pseudoModifier,
                Clans.getPlayerClan(guildMember),
                guildMember,
                players[guildMember.id].clans[clanId],
                rank,
                Object.keys(players[guildMember.id].psns).length > 0,
                Constants.PS4,
                false
            );
            if (nickname.length > 32) {
                nickname = nickname.substr(0, 32);
            }
            return guildMember.setNickname(nickname);
        }
    },
    setDisplayRank: function (guildMember, rank, displayName) {
        createUserIfNotExist(guildMember.id);
        clanId = Clans.getPlayerClan(guildMember).id;
        if (!players[guildMember.id] || !players[guildMember.id].clans[clanId] || !players[guildMember.id].clans[clanId].activeRank) {
            return;
        }
        players[guildMember.id].clans[clanId].activeRank.displayName = displayName;
        save();
        if (Constants.pseudoModifier !== 'no') {
            var nickname = Utils.replaceModifier(
                Constants.pseudoModifier,
                Clans.getPlayerClan(guildMember),
                guildMember,
                players[guildMember.id].clans[clanId],
                rank,
                Object.keys(players[guildMember.id].psns).length > 0,
                Constants.PS4,
                false
            );
            if (nickname.length > 32) {
                nickname = nickname.substr(0, 32);
            }
            return guildMember.setNickname(nickname);
        }
    },
    resetRank: function (guildMember, clan) {
        createUserIfNotExist(guildMember.id);
        clanId = clan.id;
        if (!players[guildMember.id] || !players[guildMember.id].clans[clanId]) {
            return;
        }
        
        players[guildMember.id].clans[clanId].activeRank = null;
        save();
        if (Constants.pseudoModifier !== 'no') {
            var nickname = Utils.replaceModifier(
                Constants.pseudoModifier,
                clan,
                guildMember,
                players[guildMember.id].clans[clanId],
                null,
                Object.keys(players[guildMember.id].psns).length > 0,
                Constants.PS4,
                false
            );
            if (nickname.length > 32) {
                nickname = nickname.substr(0, 32);
            }
            return guildMember.setNickname(nickname);
        }
    },
    getPlayers: function () {
        return players;
    },
    setBtag: function (id, btag) {
        return new Promise((resolve, reject) => {
            createUserIfNotExist(id);
            if (players[id].btags[btag]) {
                delete players[id].btags[btag];
                save();
                resolve(-1);
                return;
            }
            var uncriptedbtag = encodeURI(btag.replace('#', '-'));
            console.log(`https://owapi.net/api/v3/u/${uncriptedbtag}/blob`);
            request({
                url: `https://owapi.net/api/v3/u/${uncriptedbtag}/blob`,
                headers: {
                    'User-Agent': 'the cavalry discord bot'
                }
            }, (error, response, body) => {
                if (error) {
                    reject();
                    return;
                }
                var result = JSON.parse(body);
                if (!result.eu || !result.eu.stats || !result.eu.stats) {
                    reject();
                    return;
                }
                players[id].btags[btag] = { btag };
                save();
                if (result.eu && result.eu.stats && result.eu.stats.competitive && result.eu.stats.competitive.overall_stats && result.eu.stats.competitive.overall_stats.comprank) {
                    players[id].btags[btag].comprank = result.eu.stats.competitive.overall_stats.comprank;
                    players[id].lastUpdate = new Date();
                    save();
                }
                resolve(players[id].btags[btag].comprank);
            });
        });
    },
    getBtags: function (id) {
        if(!players[id])
            return null;
        return players[id].btags
    },
    setPsn: function (id, psn) {
        return new Promise((resolve, reject) => {
            createUserIfNotExist(id);
            if (players[id].psns[psn]) {
                delete players[id].psns[psn];
                save();
                resolve(-1);
                return;
            }
            var uncriptedpsn = encodeURI(psn);
            request({
                url: `https://owapi.net/api/v3/u/${uncriptedpsn}/blob?platform=psn`,
                headers: {
                    'User-Agent': 'the cavalry discord bot'
                }
            }, (error, response, body) => {
                if (error) {
                    reject();
                    return;
                }
                var result = JSON.parse(body);
                if (!result || !result.any || !result.any.stats) {
                    reject();
                    return;
                }
                players[id].psns[psn] = { psn };
                save();
                if (result.any && result.any.stats && result.any.stats.competitive && result.any.stats.competitive.overall_stats && result.any.stats.competitive.overall_stats.comprank) {
                    players[id].psns[psn].psncomprank = result.any.stats.competitive.overall_stats.comprank;
                    players[id].lastUpdate = new Date();
                    save();
                }
                resolve(players[id].psns[psn].psncomprank);
            });
        });
    },
    getPsns: function (id) {
        return players[id].psns
    },
    getComprank: function (id, btag) {
        if (!players[id].btags[btag]) {
            return null;
        }
        var btag = players[id].btags[btag];
        request({
            url: `https://owapi.net/api/v3/u/${btag.replace('#', '-')}/blob`,
            headers: {
                'User-Agent': 'the cavalry discord bot'
            }
        }, function (error, response, body) {
            if (error) {
                return;
            }
            var result = JSON.parse(body);
            if (result.eu && result.eu.stats && result.eu.stats.competitive && result.eu.stats.competitive.overall_stats && result.eu.stats.competitive.overall_stats.comprank) {
                players[id].btags[btag].comprank = result.eu.stats.competitive.overall_stats.comprank;
                players[id].lastUpdate = new Date();
                save();
            }
        });
        moment.locale('fr');
        var diff = moment.duration(moment().diff(players[id].lastUpdate)).humanize();
        return players[id].btags[btag].comprank + ` (il y a ${diff})`;
    },
    getPsnComprank: function (id, psn) {
        if (!players[id].psns[psn]) {
            return null;
        }
        var psn = players[id].psns[psn];
        request({
            url: `https://owapi.net/api/v3/u/${psn}/blob?platform=psn`,
            headers: {
                'User-Agent': 'the cavalry discord bot'
            }
        }, function (error, response, body) {
            if (error) {
                return;
            }
            var result = JSON.parse(body);
            if (result.any && result.any.stats && result.any.stats.competitive && result.any.stats.competitive.overall_stats && result.any.stats.competitive.overall_stats.comprank) {
                players[id].psns[psn].psncomprank = result.any.stats.competitive.overall_stats.comprank;
                players[id].lastUpdate = new Date();
                save();
            }
        });
        moment.locale('fr');
        var diff = moment.duration(moment().diff(players[id].lastUpdate)).humanize();
        return players[id].psns[psn].psncomprank + ` (il y a ${diff})`;
    },
    setTempClanToJoin: function (id, clan, code) {
        createUserIfNotExist(id);
        players[id].tempCode = code;
        players[id].tempGuild = clan;
        save();
    }
}