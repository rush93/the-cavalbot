const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Clans = require('../models/clans');
var Players = require('../models/players');
var Events = require('../models/event');
var commands = {
    create: {
        help: [
            'Permet de créer un event.'
        ],
        args: '<nom>[, horaires...][, question?...]',
        runCommand: (args, message) => {
            args = args.join(' ').split(', ');
            if(args.length < 0) {
                Utils.reply(message, 'Vous devez au moins mettre le nom de l\'event', true);
                return;
            }
            var event = Events.getEvent(args[0]);
            if (event) {
                Utils.reply(message, 'Un event avec ce nom existe déjà!', true);
                return;
            }
            var name = args[0];
            Events.create(name);
            args.shift();
            if(args.length > 0) {
                for (var i = 0; i < args.length; i++) {
                    if(args[i].charAt(args[i].length - 1) === '?') {
                        Events.addQuestion(name, args[i]);
                        continue;
                    }
                    Events.addTime(name, args[i]);
                }
            }
            Utils.reply(message, "Vous avez bien créer l'event.");
        }
    },
    delete: {
        help: [
            'Permet de supprimer un event.'
        ],
        args: '<nom>',
        runCommand: (args, message) => {
            var name = args.join(' ');
            if (!Events.getEvent(name)) {
                Utils.reply(message, 'Aucuns event avec ce nom.', true);
                return;
            }
            Events.delete(name);
            Utils.reply(message, 'L\'event à bien été supprimé.');
        }
    },
    list: {
        help: [
            'Affiche tout les events.'
        ],
        args: '',
        runCommand: (args, message) => {
            var events = Events.events;
            var eventsKeys = Object.keys(events);
            var fields = [];
            for (var i = 0; i < eventsKeys.length; i++) {
                fields.push({
                    title: events[eventsKeys[i]].name,
                    text: events[eventsKeys[i]].timetable.length > 0 ? events[eventsKeys[i]].timetable.join(', ') : 'aucun horaire',
                    grid: false
                });
            }
            if(fields.length > 0) {
                Utils.sendEmbed(message, 0xE8C408, 'Liste des events', '', message.author, fields);
                return;
            }
            Utils.reply(message, 'Aucuns events pour le moment.')
        }
    },
    info: {
        help: [
            'Affiche les informations d\'un event.'
        ],
        args: '<name>',
        runCommand: (args, message) => {
            var name = args.join(' ');
            var event = Events.getEvent(name);
            if(!event) {
                Utils.reply(message, 'Aucuns event avec ce nom.', true);
                return;
            }
            var fields = [];
            fields.push({
                title: 'Horaires',
                text: event.timetable.length > 0 ? event.timetable.join(', ') : 'Aucun',
                grid: false
            });
            fields.push({
                title: 'Questions',
                text: event.questions.length > 0 ? event.questions.join(`
`) : 'Aucune',
                grid: false
            });
            Utils.sendEmbed(message, 0xE8C408, event.name, '', message.author, fields);
        }
    },
    addtime: {
        help: [
            'Permet d\'ajouter un horaire à un event.'
        ],
        args: '<name> <time>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun event avec ce nom', true);
                return;
            }
            if(!Events.addTime(name, args.join(' '))) {
                Utils.reply(message, 'Cet horaire existe déjà.', true);
                return;
            }
            Utils.reply(message, 'Vous avez bien ajouté l\'horaire à l\'event.');
        }
    },
    deltime: {
        help: [
            'Permet de supprimer un horaire à un event.'
        ],
        args: '<name> <time>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun event avec ce nom', true);
                return;
            }
            if(Events.delTime(name, args.join(' '))) {
                Utils.reply(message, 'Vous avez bien supprimé l\'horaire à l\'event.');
                return;
            }
            Utils.reply(message, 'Aucun horaire avec ce nom trouvé.', true);
        }
    },
    addquestion: {
        help: [
            'Permet d\'ajouter une question à un event.'
        ],
        args: '<name> <question>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun event avec ce nom', true);
                return;
            }
            if(!Events.addQuestion(name, args.join(' '))) {
                Utils.reply(message, 'Cette question existe déjà.', true);
                return;
            }
            Utils.reply(message, 'Vous avez bien ajouté la question à l\'event.');
        }
    },
    delquestion: {
        help: [
            'Permet de supprimer une question à un event.'
        ],
        args: '<name> <question>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun event avec ce nom', true);
                return;
            }
            if(Events.delQuestion(name, args.join(' '))) {
                Utils.reply(message, 'Vous avez bien supprimé la question à l\'event.');
                return;
            }
            Utils.reply(message, 'Aucune question avec ce nom trouvé.', true);
        }
    }
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}event ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des events', "", message.author, fields);
}
module.exports = {
    role: 'MANAGE_ROLES',
    helpCat: 'Permet d\'administrer les events',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_ROLES")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour toucher au events", true);
            return;
        }
        if (args.length < 1) {
            help(message);
            return;
        }
        
        if (commands[args[0]]) {
            var label = args[0];
            args.shift();
            commands[label].runCommand(args, message);
        } else {
            help(message);
        }
    }
}