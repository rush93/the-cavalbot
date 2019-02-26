var fs = require('fs');
var Utils = require('../utils');
var players = {};

function save() {
    fs.writeFile("./data/players.json", JSON.stringify(players), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}players${Utils.Color.Reset} file was saved!`);
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

function getSumOfSeason(seasons) {
    let seasonsKeys =  Object.keys(seasons);
    let sum = 0;
    for (let seasonsKey of seasonsKeys) {
        sum += seasons[seasonsKey];
    }
    return sum;
}

load().then(() => {
    let playerIds = Object.keys(players);
    for (const playerId of playerIds) {
        let dataPlayer = players[playerId];
        let clanIds = Object.keys(dataPlayer.clans);
        for (const clanId of clanIds) {
            let dataPlayerClan = dataPlayer.clans[clanId];
            let allSeasonPoints = getSumOfSeason(dataPlayerClan.season);
            if ( dataPlayerClan.points > allSeasonPoints) {
                dataPlayerClan.points = dataPlayerClan.points - allSeasonPoints;
            }
        }
    }
    save();
});