const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var commands = {
    create: {
        help: [
            'Permet de créer un rang.'
        ],
        args: '',
        runCommand: (role, name, args, message) => {
            if (Ranks.getRank(role.id, name)) {
                Utils.reply(message, 'Ce rang pour ce clan a déjà été créé.', true);
                return;
            }
            Ranks.create(role.id, name);
            Utils.reply(message, 'Le clan a bien été créé.');
        }
    },
    delete: {
        help: [
            'Permet de supprimer un rang.'
        ],
        args: '',
        runCommand: (role, name, args, message) => {
            if (!Ranks.getRank(role.id, name)) {
                Utils.reply(message, 'Aucun rang avec ce nom pour ce clan.', true);
                return;
            }
            Ranks.delete(role.id, name);
            Utils.reply(message, 'Le rang a bien été supprimé.');
        }
    },
    setpoints: {
        help: [
            'Permet de modifier le nombre de points qu\'il faut pour ce rang.'
        ],
        args: '<points>',
        runCommand: (role, name, args, message) => {
            if (!Ranks.getRank(role.id, name)) {
                Utils.reply(message, 'Aucun rang avec ce nom pour ce clan.', true);
                return;
            }
            var points = Number(args[0]);
            if (isNaN(points)) {
                Utils.reply(message, 'Le nombre de points doit être un nombre.', true);
                return;
            }
            Ranks.setPoints(role.id, name, points);
            Utils.reply(message, "Le nombre de points du rang a bien été modifié.");
            return;
        }
    },
    setsmiley: {
        help: [
            'Permet de modifier le smiley d\'un rang.'
        ],
        args: '<:smiley:>',
        runCommand: (role, name, args, message) => {
            if (!Ranks.getRank(role.id, name)) {
                Utils.reply(message, 'Aucun rang avec ce nom pour ce clan.', true);
                return;
            }
            if (!args[0]) {
                Utils.reply(message, 'Vous devez mettre un smiley.', true);
                return;
            }
            Ranks.setSmiley(role.id, name, args.join(' '));
            Utils.reply(message, "Le smiley de points du rang a bien été modifié.");
            return;
        }
    },
    setiscustomable: {
        help: [
            'Si a \'true\' le nom du rang pourra être modifié par les utilisateurs.'
        ],
        args: '[true|false]',
        runCommand: (role, name, args, message) => {
            if (!Ranks.getRank(role.id, name)) {
                Utils.reply(message, 'Aucun rang avec ce nom pour ce clan.', true);
                return;
            }
            if (args[0].toLowerCase() !== "true" && args[0].toLowerCase() !== "false") {
                Utils.reply(message, "la valeur doit être 'true' ou 'false'.", true);
                return;
            }
            Ranks.setIsCustomable(role.id, name, args[0].toLowerCase() === "true");
            Utils.reply(message, "Le rang est maintenant " + (args[0].toLowerCase() === "true" ? 'customisable' : 'non customisable') + ".");
            return;
        }
    },
    setrole: {
        help: [
            'attache un rôle au rang.'
        ],
        args: '<@role>',
        runCommand: (role, name, args, message) => {
            if (!Ranks.getRank(role.id, name)) {
                Utils.reply(message, 'Aucun rang avec ce nom pour ce clan.', true);
                return;
            }
            var attachRole = message.mentions.roles.last();
            if (!attachRole) {
                Utils.reply(message, "Vous devez mentionner un rôle à attacher.", true);
                return;
            }
            Ranks.setRole(role.id, name, attachRole);
            Utils.reply(message, "Le rôle a bien été attaché au rôle.");
            return;
        }
    }
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}rang <clan> <name> ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des rangs', "", message.author, fields);
}
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet d\'administrer les rangs',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour administrer les rangs", true);
            return;
        }
        if (args.length < 2) {
            help(message);
            return;
        }
        var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
        args = reg[2].trim().split(' ');
        var roleName = reg[1].replace(/"/g, '');
        var role = Clans.getRoleByName(roleName, message.channel.guild);
        if (!role) {
            Utils.reply(message, "Aucun rôle avec ce nom", true);
            return;
        }
        var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
        args = reg[2].trim().split(' ');
        var name = reg[1].replace(/"/g, '');
        if (commands[args[0]]) {
            var label = args[0];
            args.shift();
            commands[label].runCommand(role, name, args, message);
        } else {
            help(message);
        }
    }
}