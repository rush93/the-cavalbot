const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Clans = require('../models/clans');
var Players = require('../models/players');
var Events = require('../models/event');
var commands = {
    create: {
        help: [
            'Permet de créer un évent.'
        ],
        args: '<nom>[, horaires...][, question?...]',
        runCommand: (args, message) => {
            args = args.join(' ').split(', ');
            if(args.length < 0) {
                Utils.reply(message, 'Vous devez au moins mettre le nom de l\'évent', true);
                return;
            }
            var event = Events.getEvent(args[0]);
            if (event) {
                Utils.reply(message, 'Un évent avec ce nom existe déjà!', true);
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
            Utils.reply(message, "Vous avez bien créé l'évent.");
        }
    },
    delete: {
        help: [
            'Permet de supprimer un évent.'
        ],
        args: '<nom>',
        runCommand: (args, message) => {
            var name = args.join(' ');
            if (!Events.getEvent(name)) {
                Utils.reply(message, 'Aucun évent avec ce nom.', true);
                return;
            }
            Events.delete(name);
            Utils.reply(message, 'L\'évent a bien été supprimé.');
        }
    },
    list: {
        help: [
            'Affiche tous les évents.'
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
                Utils.sendEmbed(message, 0xE8C408, 'Liste des évents', '', message.author, fields);
                return;
            }
            Utils.reply(message, 'Aucun évent pour le moment.')
        }
    },
    info: {
        help: [
            'Affiche les informations d\'un évent.'
        ],
        args: '<name>',
        runCommand: (args, message) => {
            var name = args.join(' ');
            var event = Events.getEvent(name);
            if(!event) {
                Utils.reply(message, 'Aucun évent avec ce nom.', true);
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
            'Permet d\'ajouter un horaire à un évent.'
        ],
        args: '<name> <time>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun évent avec ce nom', true);
                return;
            }
            if(!Events.addTime(name, args.join(' '))) {
                Utils.reply(message, 'Cet horaire existe déjà.', true);
                return;
            }
            Utils.reply(message, 'Vous avez bien ajouté l\'horaire à l\'évent.');
        }
    },
    deltime: {
        help: [
            'Permet de supprimer un horaire à un évent.'
        ],
        args: '<name> <time>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun évent avec ce nom', true);
                return;
            }
            if(Events.delTime(name, args.join(' '))) {
                Utils.reply(message, 'Vous avez bien supprimé l\'horaire à l\'évent.');
                return;
            }
            Utils.reply(message, 'Aucun horaire avec ce nom trouvé.', true);
        }
    },
    addquestion: {
        help: [
            'Permet d\'ajouter une question à un évent.'
        ],
        args: '<name> <question>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun évent avec ce nom', true);
                return;
            }
            if(!Events.addQuestion(name, args.join(' '))) {
                Utils.reply(message, 'Cette question existe déjà.', true);
                return;
            }
            Utils.reply(message, 'Vous avez bien ajouté la question à l\'évent.');
        }
    },
    delquestion: {
        help: [
            'Permet de supprimer une question à un évent.'
        ],
        args: '<name> <question>',
        runCommand: (args, message) => {
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var name = reg[1].replace(/"/g, '');
            var event = Events.getEvent(name);
            if (!event) {
                Utils.reply(message, 'Aucun évent avec ce nom', true);
                return;
            }
            if(Events.delQuestion(name, args.join(' '))) {
                Utils.reply(message, 'Vous avez bien supprimé la question à l\'évent.');
                return;
            }
            Utils.reply(message, 'Aucune question avec ce nom trouvée.', true);
        }
    },
    participants: {
        help: [
            'Permet d\'afficher la liste des participants.'
        ],
        args: '<name>',
        runCommand: (args, message) => {
            var event = Events.getEvent(args.join(' '));
            if (!event) {
                Utils.reply(message, 'Cet évent n\'existe pas.', true);
                return;
            }
            var participants = event.participants;
            var participantsKeys = Object.keys(participants);
            var fields = [];
            for (var i = 0; i < participantsKeys.length; i++) {
                var globalPlayer = Players.getPlayers()[participantsKeys[i]];
                var btags = Players.getBtags(participantsKeys[i])
                var btag = btags[Object.keys(btags)[0]];
                var psns = Players.getPsns(participantsKeys[i])
                var psn = psns[Object.keys(psns)[0]];

                var participation = participants[participantsKeys[i]];
                var questions = Object.keys(participation.questions).map(function(key) {
                    return participation.questions[key];
                });
                let member = message.guild.members.get(participantsKeys[i]);
                if (!member) {
                    continue;
                }
                fields.push({
                    title:  message.guild.members.get(participantsKeys[i]).displayName,
                    text: 
(btags && Object.keys(btags).length > 0 ? `**Btag**: ${btag.btag} (${btag.comprank ? btag.comprank : 0 })` : '' ) +
(psns && Object.keys(psns).length > 0 ? `**PSN**: ${psn.psn} (${psn.psncomprank ? psn.psncomprank : 0 })` : '' ) + 
` ${globalPlayer && globalPlayer.epou ? `
:ring: <@!${globalPlayer.epou}>` : ''} `+`
**horaire**: ${participation.timetable.join(', ')}
**réponse**: ${questions.join(' - ')}
`,
                    grid: true
                });
            }
            Utils.sendEmbed(message, 0x00AFFF , 'Liste des participants de l\'évent ' + event.name,'', message.author, fields );
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
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des évents', "", message.author, fields);
}
module.exports = {
    role: 'MANAGE_ROLES',
    helpCat: 'Permet d\'administrer les évents',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_ROLES")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour toucher aux évents", true);
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
