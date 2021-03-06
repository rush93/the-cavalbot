var fs = require('fs');
var Constants = require('./constants');
var Clans = require('./clans');
var Missions = require('./mission');
var Utils = require('../utils');
var oversmash = require('oversmash');
var owjs = require('overwatch-js');
var moment = require('moment');
const ow = oversmash.default();

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
function updateBtagV2(btag, id) {
    return new Promise((resolve , reject) => {
        owjs.search(btag.toLowerCase()).then((search) => {
            if (search.length === 1) {
                owjs.getOverall('pc', 'eu', search[0].urlName).then((data) => {
                    if (data.profile.rank == "") {
                        reject('btag non trouvé');
                        return;
                    }
                    btag = search[0].name
                    players[id].btags[btag] = { btag };
                    if(data.profile.rank == "NaN") {
                        players[id].btags[btag].comprank = 0;
                        players[id].lastUpdate = new Date();
        
                    } else {
                        players[id].btags[btag].comprank = data.profile.rank;
                        players[id].lastUpdate = new Date();
                    }
                    save();
                    resolve(players[id].btags[btag].comprank);
        
                }).catch(e => {
                    reject(e);
                });
            } else {
                reject(false);
            }
        })
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
    getHistoryMission: function (message, user) {
        createUserIfNotExist(user.id);
        if(!(players[user.id].missions == null) && players[user.id].missions != undefined){
            var listMissionJoueur = players[user.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            var fields = [];
            for (var i = 0; i < key3.length; i++) {
                //title: ((i + 1) === 1 ? '1er: ' : (i+1) +'e: ') + (guildMember.nickname ? guildMember.nickname : guildMember.user.username),
                fields.push({
                    title: ""+players[user.id].missions[i].nom,
                    text: "Mode : "+players[user.id].missions[i].mode+"\nDifficulté : "+players[user.id].missions[i].difficulte+"\nDate : " + moment(players[user.id].missions[i].date).format('MM/DD/YYYY') + "\nStatus : "+(players[user.id].missions[i].status === 0 ? 'en cours' : (players[user.id].missions[i].status === 1 ? 'réussite' : (players[user.id].missions[i].status === 2 ? 'en attente de validation' : 'échouée'))),
                    grid: true
                });
            }
            var image = "https://cdn.discordapp.com/attachments/469212930177761291/513746707767492618/images.jpg";
            Utils.sendEmbed(message, 0x00AFFF, 'Historique :', '', message.author, fields, image, 10);/**/
            return 1;//ok
        }else{
            return -1;//pas d'historique
        }
    },
    getCurrentMission: function (message) {
        createUserIfNotExist(message.member.id);
        if(!(players[message.member.id].missions == null) &&  players[message.member.id].missions != undefined){
            var listMissionJoueur = players[message.member.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[message.member.id].missions[i].status == 0) {
                    //Utils.reply(message, 'vous avez deja une missions active');
                    return "Nom : "+players[message.member.id].missions[i].nom+"\nMode : "+players[message.member.id].missions[i].mode+"\nHeroe : "+players[message.member.id].missions[i].heroe+"\nDifficulté : "+players[message.member.id].missions[i].difficulte + "\n A finir avant le : " +moment(players[message.member.id].missions[i].date).add(7, 'days').format('DD/MM/YYYY');
                }
            }
            return -1;//pas de mission active
        }else{
            return -1;//pas de mission active
        }
    },
    getCurrentValidation: function (message) {
        createUserIfNotExist(message.member.id);
        if(!(players[message.member.id].missions == null) &&  players[message.member.id].missions != undefined){
            var listMissionJoueur = players[message.member.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[message.member.id].missions[i].status == 2) {
                    //Utils.reply(message, 'vous avez deja une missions en attente validation');
                    return 1;
                }
            }
            return -1;//pas de mission active
        }else{
            return -1;//pas de mission active
        }
    },
    setUnValider: function (iduser) {
        createUserIfNotExist(iduser);
        if(!(players[iduser].missions == null) &&  players[iduser].missions != undefined){
            var listMissionJoueur = players[iduser].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[iduser].missions[i].status == 2) {
                    players[iduser].missions[i].status = 0;// on remet comme si la mission etait encours
                    save();
                    return "1";
                }
            }
            return -1;//pas de mission en attente de validation
        }else{
            return -1;//pas de mission
        }
    },
    setValider: function (iduser) {
        createUserIfNotExist(iduser);
        if(!(players[iduser].missions == null) &&  players[iduser].missions != undefined){
            var listMissionJoueur = players[iduser].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[iduser].missions[i].status == 2) {
                    players[iduser].missions[i].status = 1;// valider
                    save();
                    switch (players[iduser].missions[i].difficulte) {
                        case "facile":
                            return 30;
                            break;
                        case "intermediaire":
                            return 30;
                            break;
                        case "extreme":
                            return 30;
                            break;
                        case "impossible":
                            return 30;
                            break;                    
                        default:
                            Utils.log('difficulté mission inconnue', true, '_valider','modo');
                            return 0;
                            break;
                    }
                }
            }
            return -1;//pas de mission en attente de validation
        }else{
            return -1;//pas de mission
        }
    },
    setValidation: function (message) {
        createUserIfNotExist(message.member.id);
        if(!(players[message.member.id].missions == null) &&  players[message.member.id].missions != undefined){
            var listMissionJoueur = players[message.member.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[message.member.id].missions[i].status == 0) {
                    players[message.member.id].missions[i].status = 2;// en attente validation
                    save();
                    return "1";
                }
            }
            return -1;//pas de mission active
        }else{
            return -1;//pas de mission active
        }
    },
    setTimeoutMission: function (message) {
        createUserIfNotExist(message.member.id);
        if(!(players[message.member.id].missions == null) &&  players[message.member.id].missions != undefined){
            var listMissionJoueur = players[message.member.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[message.member.id].missions[i].status == 0 || players[message.member.id].missions[i].status == 2) {
                    players[message.member.id].missions[i].status = -1;// timeout
                    save();
                    return "1";
                }
            }
            return -1;//pas de mission active
        }else{
            return -1;//pas de mission active
        }
    },
    getLastTempsMissionValider: function(message,difficulter) {
        createUserIfNotExist(message.member.id);
        if(!(players[message.member.id].missions == null) && players[message.member.id].missions != undefined){
            var listMissionJoueur = players[message.member.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            var tmp = moment("2019-01-05T10:53:10.007Z");// personne a demandé de mission avant de toute façon
            for (var i = 0; i < key3.length; i++) {
                if (players[message.member.id].missions[i].status == 1 ) {
                    if (moment(players[message.member.id].missions[i].date) > tmp)
                    {
                        tmp = moment(players[message.member.id].missions[i].date);
                    }
                }
            }
            return tmp;
        }
        return 0;
    },
    getTempsMission: function(message,difficulter) {
        createUserIfNotExist(message.member.id);
        if(!(players[message.member.id].missions == null) && players[message.member.id].missions != undefined){
            var listMissionJoueur = players[message.member.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[message.member.id].missions[i].status == 0 || players[message.member.id].missions[i].status == 2) {
                    return players[message.member.id].missions[i].date;
                }
            }
        }
        return -1;
    },
    addMission: function(message,difficulter) {
        createUserIfNotExist(message.member.id);
        if(!(players[message.member.id].missions == null) && players[message.member.id].missions != undefined){
            var listMissionJoueur = players[message.member.id].missions;
            var key3 = Object.keys(listMissionJoueur);
            for (var i = 0; i < key3.length; i++) {
                if (players[message.member.id].missions[i].status == 0 || players[message.member.id].missions[i].status == 2) {
                    //Utils.reply(message, 'vous avez deja une missions active');
                    return -1;
                }
            }
        }
        if (!players[message.member.id].missions) {
            idMission = 0;
        }else{
            var keys2 = Object.keys(players[message.member.id].missions);
            var idMission = keys2.length;
        }
        

        var listMission = Missions.getMissions();
        var keys = Object.keys(listMission);//pour pouvoir faire .length
        for (let index = 0; index < keys.length; index++) {
            if (listMission[keys[index]].difficulte != difficulter) {
                delete listMission[keys[index]];
            }
        }
        keys = Object.keys(listMission);
        if (keys.length == 0) {
            return -2;
        }
        var random = Math.floor(Math.random() * Math.floor(keys.length));
        if(players[message.member.id].missions == undefined){
            players[message.member.id].missions = {};
        }
        var datemission = new Date();
        for (let index = 0; index < keys.length; index++) {
            if (index == random) {
                players[message.member.id].missions[idMission] = {
                    id: keys[index],
                    difficulte: listMission[keys[index]].difficulte,
                    heroe: listMission[keys[index]].heroe,
                    mode: listMission[keys[index]].mode,
                    nom: listMission[keys[index]].nom,
                    status:0,
                    date: datemission
                };//status : 0 = en cours, 1=validé, -1 = temps écoulé, 2 = demande validation effectué
            }
        }
        
        save();
        return "Nom : "+players[message.member.id].missions[idMission].nom+"\nMode : "+players[message.member.id].missions[idMission].mode+"\nHeroe : "+players[message.member.id].missions[idMission].heroe+"\nDifficulté : "+players[message.member.id].missions[idMission].difficulte+"\nA valider avant le : "+moment(players[message.member.id].missions[idMission].date).add(7, 'days').format('MM/DD/YYYY');
        //TODO ajouté date de fin
    },
    setCooldownMariage: function (guildMember) {
        createUserIfNotExist(guildMember.id);
        players[guildMember.id].cooldownMariage = new Date();
        save();
    },
    setCooldown: function (guildMember) {
        createUserIfNotExist(guildMember.id);
        players[guildMember.id].cooldown = new Date();
        save();
    },
    setTestExil: function (guildMember) {
        createUserIfNotExist(guildMember.id);
        if (players[guildMember.id].testExil == undefined) {
            players[guildMember.id].testExil = 1;
        }else{
            players[guildMember.id].testExil = players[guildMember.id].testExil + 1;
        }
        save();
    },
    getTestExil: function (guildMember) {
        return players[guildMember.id].testExil;
    },
    setCooldownAdmin: function (guildMember) {
        createUserIfNotExist(guildMember.id);
        players[guildMember.id].cooldown = guildMember.joinedAt;
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
            updateBtagV2(btag, id).then(resolve).catch(reject);
        });
    },
    updateComprank: function(id) {
        createUserIfNotExist(id);
        var btagsKey = Object.keys(players[id].btags);
        for(var i = 0; i < btagsKey.length; i++) {
            updateBtagV2(btagsKey[i], id).catch((e) => { Utils.log(e, true) });
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