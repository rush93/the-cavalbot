var fs = require('fs');
var Utils = require('../utils');
var clans = {};

function saveClans() {
    fs.writeFile('./data/clans.json', JSON.stringify(clans), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}clans${Utils.Color.Reset} file was saved!`);
    });
}

function loadClans() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/clans.json', (err, data) => {
            if (err) return;
            clans = JSON.parse(data);
            resolve(clans);
        });
    })
}

var players = {};

function loadPlayers() {
    return new Promise((resolve, reject) => {

        fs.readFile('./data/players.json', (err, data) => {
            if (err) return;
            players = JSON.parse(data);
            resolve(players);
        });
    })
}

pro1 = loadClans();
pro2 = loadPlayers();

Promise.all([pro1, pro2]).then(() => {
  let playerIds = Object.keys(players);
  for (const playerId of playerIds) {
    let dataPlayer = players[playerId];
    let clanIds = Object.keys(dataPlayer.clans);
    for (const clanId of clanIds) {
      let dataPlayerClan = dataPlayer.clans[clanId];
      if (!clans[clanId]) {
        continue;
      }
      if (!clans[clanId].points) {
        clans[clanId].points = 0;
      }
      clans[clanId].points += dataPlayerClan.points;
    }
  }
  saveClans();
});