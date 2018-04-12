const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Interactions = require('../models/interactions');
var reportMessage = (message, reporter) => {
    var channel = message.channel.guild.channels.get(Constants.reportChannel);
    var fields = [
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
    ]
    Utils.sendEmbedInChannel(channel, 0xE8C408, 'Report d\'un message', '', reporter, fields);
    Utils.sendDmEmbed(reporter, 0xE8C408, 'Vous avez report', 'Ce meme message cera envoyer au administrateur.', reporter, fields);
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
        messageReaction.remove(user).catch((e) => { Utils.log(e, true) });
    }
}