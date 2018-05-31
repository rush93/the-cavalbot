var fs = require('fs');
var Constants = require('./constants');
var Clans = require('./clans');
var Utils = require('../utils');
var oversmash = require('oversmash');
const ow = oversmash.default()

var request = require('request');
var moment = require('moment');
var players = {};

function save() {
    fs.writeFile(__dirname + "/../data/players.json", JSON.stringify(players), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}players${Utils.Color.Reset} file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../data/players.json', (err, data) => {
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

function updateBtag(btag, id) {
    return new Promise((resolve , reject) => {
        var uncriptedbtag = encodeURI(btag.replace('#', '-'));
        ow.playerStats(uncriptedbtag,'', 'pc').then(player => {
            Utils.log('fin de la requete du btag ' + Utils.Color.FgYellow + btag + Utils.Color.Reset);
            if (!player.stats.quickplay.all) {
                reject('btag non trouvé');
                return;
            }
            players[id].btags[btag] = { btag };
            if(isNaN(player.stats.competitiveRank)) {
                players[id].btags[btag].comprank = 0;
                players[id].lastUpdate = new Date();
            } else {
                players[id].btags[btag].comprank = player.stats.competitiveRank;
                players[id].lastUpdate = new Date();
            }
            save();
            resolve(players[id].btags[btag].comprank);
        }).catch(e => {
            reject(e);
        });
    });
}

function updatePsn(psn, id) {
    return new Promise((resolve , reject) => {
        var uncriptedpsn = encodeURI(psn);
        ow.playerStats(uncriptedpsn,'', 'psn').then(player => {
            Utils.log('fin de la requete du psn ' + Utils.Color.FgYellow + psn + Utils.Color.Reset);
            if (!player.stats.quickplay.all) {
                reject('psn non trouvé');
                return;
            }
            players[id].psns[psn] = { psn };
            if(isNaN(player.stats.competitiveRank)) {
                players[id].psns[psn].psncomprank = 0;
                players[id].lastUpdate = new Date();
            } else {
                players[id].psns[psn].psncomprank = player.stats.competitiveRank;
                players[id].lastUpdate = new Date();
            }
            save();
            resolve(players[id].psns[psn].psncomprank);
        }).catch(e => {
            reject(e);
        });
    });
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
        clanId = Clans.getClanById(clanId).id;
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
        var curentPlayerName = guildMember.displayName;
        var curentNameWithoutReplace = Utils.replaceModifier(
            Constants.pseudoModifier,
            Clans.getPlayerClan(guildMember),
            guildMember,
            players[guildMember.id].clans[clanId],
            players[guildMember.id].clans[clanId].activeRank,
            Object.keys(players[guildMember.id].psns).length > 0,
            Constants.PS4,
            false,
            true
        );

        var sregex = Utils.getUsernameRegex(curentNameWithoutReplace);
        Utils.log('Regex created: ' + Utils.Color.FgYellow + sregex);
        var exec = RegExp(sregex, 'g').exec(curentPlayerName);
        if(!exec || exec.length < 2 ) {
            var name = guildMember.displayName;
        } else {
            var name = exec[1];
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
                false,
                false,
                name
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

        var curentPlayerName = guildMember.displayName;
        var curentNameWithoutReplace = Utils.replaceModifier(
            Constants.pseudoModifier,
            Clans.getPlayerClan(guildMember),
            guildMember,
            players[guildMember.id].clans[clanId],
            players[guildMember.id].clans[clanId].activeRank,
            Object.keys(players[guildMember.id].psns).length > 0,
            Constants.PS4,
            false,
            true
        );

        var sregex = Utils.getUsernameRegex(curentNameWithoutReplace);
        Utils.log('Regex created: ' + Utils.Color.FgYellow + sregex);
        var exec = RegExp(sregex, 'g').exec(curentPlayerName);
        if(!exec || exec.length < 2 ) {
            var name = guildMember.displayName;
        } else {
            var name = exec[1];
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
                false,
                false, 
                name
            );
            if (nickname.length > 32) {
                nickname = nickname.substr(0, 32);
            }
            return guildMember.setNickname(nickname);
        }
    },
    resetRank: function (guildMember, clan) {
        createUserIfNotExist(guildMember.id);
        clanId = Clans.getClanById(clan.id).id;
        if (!players[guildMember.id] || !players[guildMember.id].clans[clanId]) {
            return;
        }
        

        var curentPlayerName = guildMember.displayName;
        var curentNameWithoutReplace = Utils.replaceModifier(
            Constants.pseudoModifier,
            Clans.getPlayerClan(guildMember),
            guildMember,
            players[guildMember.id].clans[clanId],
            players[guildMember.id].clans[clanId].activeRank,
            Object.keys(players[guildMember.id].psns).length > 0,
            Constants.PS4,
            false,
            true
        );

        var sregex = Utils.getUsernameRegex(curentNameWithoutReplace);
        Utils.log('Regex created: ' + Utils.Color.FgYellow + sregex);
        var exec = RegExp(sregex, 'g').exec(curentPlayerName);
        if(!exec || exec.length < 2 ) {
            var name = guildMember.displayName;
        } else {
            var name = exec[1];
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
                false,
                false,
                name
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
            updateBtag(btag, id).then(resolve).catch(reject);
        });
    },
    updateComprank: function(id) {
        createUserIfNotExist(id);
        var btagsKey = Object.keys(players[id].btags);
        for(var i = 0; i < btagsKey.length; i++) {
            updateBtag(btagsKey[i], id).catch((e) => { Utils.log(e, true) });
        }
        var psnsKey = Object.keys(players[id].psns);
        for(var i = 0; i < psnsKey.length; i++) {
            updatePsn(psnsKey[i], id).catch((e) => { Utils.log(e, true) });
        }
    },
    getBtags: function (id) {
        createUserIfNotExist(id);
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
            updatePsn(psn, id).then(resolve).catch(reject);
        });
    },
    getPsns: function (id) {
        createUserIfNotExist(id);
        return players[id].psns
    },
    setTempClanToJoin: function (id, clan, code) {
        createUserIfNotExist(id);
        players[id].tempCode = code;
        players[id].tempGuild = clan;
        save();
    },
    setEpou: function (player, epou) {
        createUserIfNotExist(player.id);
        players[player.id].epou = epou.id;
        createUserIfNotExist(epou.id);
        players[epou.id].epou = player.id;
        save();
    },
    hasEpou: function (player) {
        return players[player.id] && players[player.id].epou;
    },
    getEpou: function (player) {
        return players[player.id] ? players[player.id].epou : null;
    },
    divorse: function (user1, user2) {
        players[user1.id].epou = null;
        players[user2.id].epou = null;
        save();
    },
    divorse: function (user) {
        players[user.id].epou = null;
        save();
    },
    hasAskFor: function (player) {
        return players[player.id] && players[player.id].askFor;
    },
    getAskFor: function (player) {
        return players[player.id] ? players[player.id].askFor : null;
    },
    setAskFor: function (player, askFor) {
        createUserIfNotExist(player.id);
        players[player.id].askFor = askFor ? askFor.id : null;
        save();
    },
    setSeasonPoints(playersId, clanId, season, withoutSave = false) {
        createUserIfNotExist(playersId);
        clanId = Clans.getClanById(clanId).id;
        if ( !players[playersId].clans[clanId] ) {
            return;
        }
        if (!players[playersId].clans[clanId].season) {
            players[playersId].clans[clanId].season = {};
        }
        players[playersId].clans[clanId].season[season] = players[playersId].clans[clanId].points;
        if (!withoutSave) {
            save();
        }
    }
}