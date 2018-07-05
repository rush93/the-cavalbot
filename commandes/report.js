const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Interactions = require('../models/interactions');
const moment = require('moment');

var reportMessage = (message, reporter) => {
    var channel = message.channel.guild.channels.get(Constants.reportChannel);
    var fields = [
        {
            title: 'Qui est-ce qui a écrit ?',
            text: `${message.member}`,
            grid: true
        },
        {
            title: 'Qui est-ce qui a report ?',
            text: `<@!${reporter.id}>`,
            grid: true
        },
        {
            title: 'Dans quel channel cela s\'est-il passé ?',
            text: `<#${message.channel.id}>`,
            grid: true
        },
        {
            title: 'Quand le message a été posté ?',
            text: moment(message.createdTimestamp).format("DD MMM YYYY hh:mm a"),
            grid: true
        },
        {
            title: 'Qu\'est ce qui a été dit ?',
            text: message.content,
            grid: true
        }
    ]
    Utils.sendEmbedInChannel(channel, 0xE8C408, 'Report d\'un message', '', reporter, fields);
    Utils.sendDmEmbed(reporter, 0xE8C408, 'Vous avez report', 'Ce même message sera envoyé aux administrateurs.', reporter, fields);
}
module.exports = {
    role: 'SEND_MESSAGES',
    helpCat: 'Permet de report un message',
    help: function (message) {
        Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande report", "", message.author, [{
            title: Constants.prefix + 'report [id_message]',
            text: "Permet d\'épingler un message",
            grid: false
        }]);
    },
    runCommand: (args, message) => {
        if (!Constants.reportChannel) {
            Utils.reply(message,
                "Alors t'es bien gentil mais en fait y'a pas de channel où je peux dire que t'as report le message... Donc appelle un admin et dis lui de bouger ces fesses !",
                true);
            return;
        }
        if(args.length === 0) {
            Interactions.addReactInteractions('report', 'reactReportMessage', null, message.author.id);
            message.delete().catch((e) => { Utils.log(e, true) });
            Utils.sendDM(message.author,`Réagis avec ${Utils.UnicodeCancelReact} sur le message que tu veux report`);
            return;
        }
        message.channel.fetchMessage(args[0]).then((reportedMessage) => {
            reportMessage(reportedMessage, message.author);
        }).catch(() => {
            Utils.reply(message, 'Désolé je n\'ai pas trouvé de message avec cet id dans ce channel.', true);
        });
        message.delete().catch((e) => { Utils.log(e, true) });
    },
    reactReportMessage: (messageReaction, user) => {
        reportMessage(messageReaction.message, user);
        Interactions.delReactInteractions(user.id);
        messageReaction.remove(user).catch((e) => { Utils.log(e, true) });
    }
}