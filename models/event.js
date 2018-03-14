var fs = require('fs');
var Constants = require('./constants');
var Utils = require('../utils');

var events = {};

function save() {
    fs.writeFile("./data/events.json", JSON.stringify(events), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}events${Utils.Color.Reset} file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile('./data/events.json', (err, data) => {
            if (err) return;
            events = JSON.parse(data);
            resolve(events);
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
    create: function(name) {
        var key = name.toLowerCase();
        if (events[key]) {
            return null;
        }
        events[key] = {
            name: name,
            timetable: [],
            questions: [],
            participants: {}
        };
        save();
    },
    delete: function(name) {
        var key = name.toLowerCase();
        if (!events[key]) {
            return null;
        }
        delete events[key];
        save();
    },
    get events() {
        return events;
    },
    getEvent: function(name) {
        return events[name.toLowerCase()];
    },
    addTime: function(name, time) {
        var key = name.toLowerCase();
        if(!events[key]) {
            return null;
        }
        if(events[key].timetable.indexOf(time) >= 0) {
            return null;
        }
        events[key].timetable.push(time);
        save();
        return true;
    },
    delTime: function(name, time) {
        var key = name.toLowerCase();
        if(!events[key]) {
            return null;
        }
        if(events[key].timetable.indexOf(time) < 0) {
            return null;
        }
        events[key].timetable.splice(events[key].timetable.indexOf(time), 1);
        save();
        return true;
    },
    addQuestion: function(name, question) {
        var key = name.toLowerCase();
        if(!events[key]) {
            return null;
        }
        if(events[key].questions.indexOf(question) >= 0) {
            return null;
        }
        events[key].questions.push(question);
        save();
        return true;
    },
    delQuestion: function(name, question) {
        var key = name.toLowerCase();
        if(!events[key]) {
            return null;
        }
        if(events[key].questions.indexOf(question) < 0) {
            return null;
        }
        events[key].questions.splice(events[key].questions.indexOf(question), 1);
        save();
        return true;
    },
    addParticipant: function(name, userId) {
        var key = name.toLowerCase();
        if (!events[key]) {
            return null;
        }
        events[key].participants[userId] = {
            timetable: [],
            questions: {}
        };
        save();
    },
    delParticipant: function(name, userId) {
        var key = name.toLowerCase();
        if (!events[key]) {
            return null;
        }
        delete events[key].participants[userId];
        save();
    },
    setParticiapantTimetable: function(name, userId, timetable) {
        var key = name.toLowerCase();
        if (!events[key]) {
            return null;
        }
        if(!events[key].participants[userId]) {
            events[key].participants[userId] = {
                timetable: [],
                questions: {}
            };
        }
        events[key].participants[userId].timetable = timetable
        save();
    },
    setParticiapantQuestion: function(name, userId, question, response) {
        var key = name.toLowerCase();
        if (!events[key]) {
            return null;
        }
        if(!events[key].participants[userId]) {
            events[key].participants[userId] = {
                timetable: [],
                questions: {}
            };
        }
        if(!events[key].participants[userId].questions) {
            events[key].participants[userId].questions = {};
        }
        events[key].participants[userId].questions[question] = response;
        save();
    }
}