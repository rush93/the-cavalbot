const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Interactions = require('../models/interactions');
var reportMessage = (message, reporter) => {
    var channel = message.channel.guild.channels.get(Constants.reportChannel);
    Utils.sendEmbedInChannel(channel, 0xE8C408, 'Report d\'un message', '', reporter, [
        {
            title: 'ki ka écrit',
            text: `${message.member}`,
            grid: true
        },
        {
            title: 'ki ka report',
            text: `<@!${reporter.id}>`,
            grid: true
        },
        {
            title: 'ou cé',
            text: `<#${message.channel.id}>`,
            grid: true
        },
        {
            title: 'il a di kwa',
            text: message.content,
            grid: true
        }
    ]);
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
                "Alors t'es bien gentil mais enfait ya pas de channel ou je peux dire que ta report le message. Donc appel un admin et dis lui de bouger ces fesses !",
                true);
            return;
        }
        if(args.length === 0) {
            Interactions.addReactInteractions('report', 'reactReportMessage', null, message.author.id);
            Utils.reply(message, `Réagis avec ${Utils.UnicodeCancelReact} sur le message que tu veux report`);
            return;
        }
        message.channel.fetchMessage(args[0]).then((reportedMessage) => {
            reportMessage(reportedMessage, message.author);
            Utils.reply(message, 'Le message a bien été report.');
        }).catch(() => {
            Utils.reply(message, 'Désolé je n\'ai pas trouvé de message avec cet id dans ce channel.', true);
        })
    },
    reactReportMessage: (messageReaction, user) => {
        reportMessage(messageReaction.message, user);
        Utils.reply(messageReaction.message, "Le message a été report!");
    }
}