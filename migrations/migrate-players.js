// THIS FILE IS FOR MIGRATE ALL PLAYER FORMAT TO THE NEW PLAYER FORMAT
var fs = require('fs');

var players = {};
var newPlayers = {};

function save() {
    fs.writeFile("./data/players.json", JSON.stringify(newPlayers), function (err) {
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
load().then(() => {
    var playerKeys = Object.keys(players);
    for(var j = 0; j < playerKeys.length; j++) {
        var player = players[playerKeys[j]];
        if(!player || !player.id) {
            continue;
        }
        var keys = Object.keys(player);
        var newPlayer = {
            id: player.id,
            clans: {},
            btags: {},
            psns: {},
            lastUpdate: player.lastUpdate,
            cooldown: player.cooldown
        }
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            switch (key) {
                case 'id':
                case 'comprank':
                case 'psncomprank':
                case 'lastUpdate':
                case 'tempCode':
                case 'tempGuild':
                case 'cooldown':
                case 'tempCode':
                    break;
                case 'btag':
                    newPlayer.btags[player.btag] = {
                        btag: player.btag,
                        comprank: player.comprank
                    };
                    break;
                case 'psn':
                    newPlayer.psns[player.psn] = {
                        psn: player.psn,
                        psncomprank: player.psncomprank
                    };
                    break;
                default:
                    newPlayer.clans[key] = player[key];
                    break;
            }
        }
        newPlayers[newPlayer.id] = newPlayer;
    };
    save();
}).catch(e => {
    console.log(e);
});
