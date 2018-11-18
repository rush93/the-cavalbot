var fs = require('fs');
var Constants = require('./constants');
var Utils = require('../utils');
var path = require(`path`);

var missions = {};
var missionsMap = {};

function save() {
    fs.writeFile(path.resolve(__dirname + '/../data/missions.json'), JSON.stringify(missions), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}missions${Utils.Color.Reset} file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + '/../data/missions.json', (err, data) => {
            if (err) return;
            missions = JSON.parse(data);
            resolve(missions);
        });
    })
}

module.exports = {
    init: function () {
        return new Promise((resolve, reject) => {
            load()
                .then(r => {
                    resolve(r)
                    var ids = Object.keys(missions);
                })
                .catch(e => reject(e));
        });
    },
    save: function () {
        save();
    },
    createMission: function (desc, difficulte, mode, hero, event) {
        var ids = Object.keys(missions);
        missions[ids.length] = {
            nom: desc,
            active: true,
            difficulte: difficulte,
            mode: mode,
            heroe: hero,
            event: event
        };
        save();
    },
    getMissions: function () {
        return missions;
    },
    modifEtat: function (nomEvent, etat) {
        var ids = Object.keys(missions);
        for (var i = 0; i < ids.length; i++) {
            if (missions[i].event == nomEvent) {
                missions[i].active = etat;
            }
        }
        save();
    }
}