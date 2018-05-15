const Utils = require('../utils');
const Discord = require('discord.js');
var constants = require('../models/constants');

var commands = {
    prefix: {
        help: [
            'Permet de changer le préfixe des commandes du bot.'
        ],
        args: '[prefix]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**Préfixe**: " + constants.prefix);
                return;
            }
            constants.prefix = args.join(' ');
            Utils.reply(message, 'Le préfixe a bien été modifié.');
        }
    },
    pseudoModifier: {
        help: [
            'Permet de changer le pseudo des joueurs en fonction de leurs rangs',
            '**%rank%**le nom du rang',
            '**%srank%** le smiley du rang',
            '**%clan%** le nom du clan',
            '**%sclan%** le smiley du clan',
            '**%player%** le nom du joueur',
            '**%PS4%** s\'il s\'agit d\'un joueur ps4',
            'pour que le bot ne modifie pas les noms mettez \'no\''
        ],
        args: '[modifier]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**pseudoModifier**: " + constants.pseudoModifier);
                return;
            }
            constants.pseudoModifier = args.join(' ');
            Utils.reply(message, 'Le pseudo a bien été modifié.');
        }
    },
    resetRankWhenChangeClan: {
        help: [
            'Est-ce que le rang sera reset lors du changement de clan ?'
        ],
        args: '[true|false]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**resetRankWhenChangeClan**: " + constants.resetRankWhenChangeClan);
                return;
            }
            if (args[0].toLowerCase() !== "true" && args[0].toLowerCase() !== "false") {
                Utils.reply(message, "la valeur doit être 'true' ou 'false'.", true);
                return;
            }
            constants.resetRankWhenChangeClan = args[0].toLowerCase() === "true";
            Utils.reply(message, 'Le resetRankWhenChangeClan a bien été modifiée.');
        }
    },
    leaveCooldown: {
        help: [
            'Au bout de combien de minutes est-il possible de faire !leave après un join.',
            'mettre à -1 pour que le leave soit désactivé.'
        ],
        args: '[minutes]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**leaveCooldown**: " + constants.leaveCooldown);
                return;
            }
            var num = Number(args[0]);
            if (isNaN(num)) {
                Utils.reply(message, "la valeur doit être nombre.", true);
                return;
            }
            constants.leaveCooldown = num;
            Utils.reply(message, 'Le leaveCooldown a bien été modifié.');
        }
    },
    joinmessage: {
        help: [
            'Le message qui sera affiché quand un nouveau membre rejoinds le clan',
            'mettre à \'no\' pour que le message soit désactivé.',
            '**%clan%** le nom du clan',
            '**%player%** le nom du joueur'
        ],
        args: '[message]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**joinmessage**: " + constants.joinmessage);
                return;
            }
            constants.joinmessage = args.join(' ');
            Utils.reply(message, 'Le joinmessage a bien été modifié.');
        }
    },
    leavemessage: {
        help: [
            'Le message qui sera affiché quand un membre quitte le clan',
            'mettre à \'no\' pour que le message soit désactivé.',
            '**%clan%** le nom du clan',
            '**%player%** le nom du joueur'
        ],
        args: '[message]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**leavemessage**: " + constants.leavemessage);
                return;
            }
            constants.leavemessage = args.join(' ');
            Utils.reply(message, 'Le leavemessage a bien été modifié.');
        }
    },
    ps4: {
        help: [
            'les lettres qui seront ajoutées au pseudo du joueur si c\'est un joueur ps4',
        ],
        args: '[lettres]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**ps4**: " + constants.PS4);
                return;
            }
            constants.PS4 = args.join(' ');
            Utils.reply(message, 'Le ps4 a bien été modifiée.');
        }
    },
    domain: {
        help: [
            'le nom de domaine du site.',
        ],
        args: '[url]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**domaine: **: " + constants.domain);
                return;
            }
            constants.domain = args.join(' ');
            Utils.reply(message, 'Le nom de domaine a bien été modifié.');
        }
    },
    reportChannel: {
        help: [
            'le channel où seront report les messages.',
        ],
        args: '[url]',
        runCommand: (args, message) => {
            if (args.length === 0) {
                Utils.reply(message, "**channel: **: <#" + constants.reportChannel + ">");
                return;
            }
            if (!message.mentions.channels && !message.mentions.channels.first()) {
                Utils.reply(message,"il faut mentionner un message.",true);
                return;
            }
            constants.reportChannel = message.mentions.channels.first().id;
            Utils.reply(message, 'Le channel de report a bien été modifié.');
        }
    }
}

var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${constants.prefix}config ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes de config', "", message.author, fields);
}

module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet de changer les configurations de base du bot',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour changer les config", true);
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