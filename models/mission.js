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

var getRoleByName = function (name, guild) {
    if (missionsMap[name]) {
        return guild.roles.get(missionsMap[name]);
    }
    var role = guild.roles.find('name', name);
    if (role) {
        missionsMap[role.name] = role.id;
    }
    return role;
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
    }
}