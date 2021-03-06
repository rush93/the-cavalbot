const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
var Events = require('../models/event');
var Interactions = require('../models/interactions');
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de participer à un event.',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande participe", "", message.author, [{
            title: Constants.prefix + 'participe <nom de l\'event>',
            text: "Permet de participer à un event.",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        var btags = Players.getBtags(message.author.id);
        var psns = Players.getPsns(message.author.id);
        if((!btags || Object.keys(btags).length === 0) && (!psns || Object.keys(psns).length === 0)) {
            Utils.reply(message, `Vous devez ajouter au moins un btag ou psn pour participer au events.
ajouter un btag: **${Constants.prefix}btag votrebtag**
ajouter un psn: **${Constants.prefix}psn votrepsn**
`, true);
            return;
        }
        if ( args.length <= 0) {
            var events = Events.events;
            if (events.length <= 0) {
                Utils.reply(message, 'Aucun évent en cours.', true);
                return;
            }
            var fields = [];
            var eventsKey = Object.keys(events);
            for (var i = 0; i < eventsKey.length; i++) {
                fields.push({
                    title: events[eventsKey[i]].name,
                    text: `:${Utils.ReactMap[i]}:`,
                    grid: true
                });
            }
            var authorId = message.author.id;
            Utils.sendDmEmbed(message.author, 0x00AFFF,
                'Veuillez choisir un évent.',
                `Vous devez réagir suivant ce que vous voulez`,
                message.author, fields
            ).then((message) => {
                Interactions.addReactInteractions('participe', 'chooseEvent', message.id, authorId);
                Utils.reactNbTime(message, eventsKey.length);
            }).catch((e) => {
                Utils.log(e, true);
            });
            Utils.reply(message, 'Regarde dans tes messages privés :wink:');
            return;
        }
        var event = Events.getEvent(args.join(' '));
        if (!event) {
            Utils.reply(message, 'Aucun évent avec ce nom.');
            return;
        }

        Events.addParticipant(event.name, message.author.id);
        var fields = [];
        const limite = event.limite ? Number(event.limite) : 0;
        for (var i = 0; i < event.timetable.length; i++) {
            if (limite > 0) {
                if (Events.getNbParticipants(event.name, event.timetable[i]) >= limite) {
                    continue;
                }
            } 
            fields.push({
                title: event.timetable[i],
                text: `:${Utils.ReactMap[i]}:`,
                grid: true
            });
        }
        var authorId = message.author.id;
        Utils.sendDmEmbed(message.author, 0x00AFFF,
            `Veuillez choisir un horaire pour l\'évent ${event.name}.`,
            `Vous devez réagir à un ou plusieurs horaires
puis réagir avec :white_check_mark: pour valider
ou :x: pour annuler la participation`,
            message.author, fields
        ).then((message) => {
            Interactions.addReactInteractions('participe', 'chooseTimetable', message.id, authorId, [event.name]);
            Utils.reactNbTime(message, event.timetable.length, true, true);
        }).catch((e) => {
            Utils.log(e, true);
        });
        Utils.reply(message, 'Regarde dans tes messages privés :wink:');
    },
    chooseEvent: (messageReaction, user) => {
        var index = Utils.InvertedUnicodeReactMap()[messageReaction.emoji.name];
        if (!index) {
            return;
        }
        var message = messageReaction.message;
        var events = Events.events;
        var eventsKey = Object.keys(events);
        var key = eventsKey[index];
        if (!key) {
            Utils.sendDM(user, 'Aucun évent attribué à cette réaction.', true);
            return;
        }
        Interactions.delReactInteractions(message.id);
        Utils.removeMyReact(message);
        var event = Events.getEvent(key);
        Events.addParticipant(key, user.id);
        var fields = [];
        const limite = event.limite ? Number(event.limite) : 0;
        var ignoreReact = [];
        for (var i = 0; i < event.timetable.length; i++) {
            if (limite > 0) {
                if (Events.getNbParticipants(event.name, event.timetable[i]) >= limite) {
                    ignoreReact.push(i);
                    continue;
                }
            }
            fields.push({
                title: event.timetable[i],
                text: `:${Utils.ReactMap[i]}:`,
                grid: true
            });
        }
        if (fields.length <= 0) {
            Utils.sendDM(user, 'Plus de place pour cet event.', true);
            return;
        }
        Utils.sendDmEmbed(user, 0x00AFFF,
            `Veuillez choisir un horaire pour l\'évent ${event.name}.`,
            `Vous devez réagir à un ou plusieurs horaires
puis réagir avec :white_check_mark: pour valider
ou :x: pour annuler la participation`,
            user, fields
        ).then((message) => {
            Interactions.addReactInteractions('participe', 'chooseTimetable', message.id, user.id, [key]);
            Utils.reactNbTime(message, event.timetable.length, true, true, ignoreReact);
        }).catch((e) => {
            Utils.log(e, true);
        });
    },
    chooseTimetable: (messageReaction, user, eventKey) => {
        if ( messageReaction.emoji.name !== Utils.UnicodeConfirmReact && messageReaction.emoji.name !== Utils.UnicodeCancelReact ) {
            return;
        }
        if (messageReaction.emoji.name === Utils.UnicodeCancelReact) {
            Events.delParticipant(eventKey, user.id);
            Interactions.delReactInteractions(messageReaction.message.id);
            Utils.removeMyReact(messageReaction.message);
            Utils.sendDM(user, `Votre participation à l'évent ${Events.getEvent(eventKey).name} a été annulé.`);
            return;
        }
        var reactions = messageReaction.message.reactions.array();
        var event = Events.getEvent(eventKey);
        if (!event) {
            Utils.sendDM(user, 'Cet évent n\'existe plus', true);
            return;
        }
        var choosenTime = [];
        var limiteReach = []
        const limite = event.limite ? Number(event.limite) : 0;
        for (var i = 0; i < reactions.length; i++) {
            var key = Utils.InvertedUnicodeReactMap()[reactions[i].emoji.name];
            if (key && reactions[i].count > 1 && event.timetable.length > key) {
                if (limite > 0 && limite < Events.getNbParticipants(event.name, event.timetable[key])) {
                    limiteReach.push(event.timetable[key]);
                    continue;
                }
                choosenTime.push(event.timetable[key]);
            }
        }
        if (limiteReach.length !== 0) {
            Utils.sendDM(user, 'Les horraires ' + limiteReach.join(', ') + ' sont déjà pleines.', true);
            return;
        }
        if (choosenTime.length === 0) {
            Utils.sendDM(user, 'Vous devez choisir au moins un horaire.', true);
            return;
        }
        Utils.removeMyReact(messageReaction.message);
        Interactions.delReactInteractions(messageReaction.message.id);
        Events.setParticiapantTimetable(eventKey, user.id, choosenTime);
        if (!event.questions || event.questions.length <= 0) {
            Utils.sendDM(user, 'Votre participation a bien été pris en compte.');
            return;
        }
        questionLeft = event.questions.slice(0);;
        Utils.sendDmEmbed(user, 0x00AFFF, questionLeft[0], 'Répondez à l\'écrit.', user, []);
        questionLeft.shift();
        Interactions.addChatInteractions('participe', 'answerQuestion', user.id, null, [event.name, event.questions[0], questionLeft]);
    },
    answerQuestion: function (message, eventKey, question, questionLeft) {
        var event = Events.getEvent(eventKey);
        var user = message.author;
        if (!event) {
            Utils.sendDM(user, 'Cet évent n\'existe plus.', true);
            return;
        }
        Events.setParticiapantQuestion(eventKey, message.author.id, question, message.content);
        Interactions.delChatInteractions(user.id);

        if (!questionLeft || questionLeft.length <= 0) {
            Utils.sendDM(user, 'Votre participation a bien été prise en compte.');
            return;
        }
        var nextQuestion = questionLeft.shift();
        Utils.sendDmEmbed(user, 0x00AFFF, nextQuestion, 'Répondez à l\'écrit.', user, []);
        Interactions.addChatInteractions('participe', 'answerQuestion', user.id, null, [event.name, nextQuestion, questionLeft]);
    }
}