const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Clans = require('../models/clans');
var Players = require('../models/players');
var commands = {
    create: {
        help: [
            'Permet de créer un clan.'
        ],
        args: '',
        runCommand: (clan, args, message) => {
            if (Clans.getClan(clan)) {
                Utils.reply(message, 'Un clan avec ce rôle a déjà été créé.', true);
                return;
            }
            Clans.createClan(clan);
            Utils.reply(message, 'Le clan a bien été créé.')
        }
    },
    setJoin: {
        help: [
            'Permet d\'ouvrir ou non un clan. true(ouvert) ou false(fermé)'
        ],
        args: 'true/false',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            let value = args[0].toLowerCase()
            if ( value != "true" && value != "false" ) {
                Utils.reply(message, 'Vous devez mettre true(ouvert) ou false(fermé).', true);
                return;
            }else{
                if (value === 'true') {
                     Clans.setDescription(clan, "Ouvert\n_join "+clan.name);
                }else{
                    Clans.setDescription(clan, "Fermé");
                }
                Clans.setJoin(clan, value === 'true');
                Utils.reply(message, 'Les portes du clan on bien été modifié. : ' + args[0]);
            }
            
        }
    },
    setFaction: {
        help: [
            'Permet de lier une factions. exemple _clan clan setFaction @clan'
        ],
        args: '*id du role de la faction*',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            let role = message.mentions.roles.first();
            if (!role) {
                Utils.reply(message, "Aucuns role mentionner.");
                return;
            }
            Clans.setFaction(clan, role.id);
            Utils.reply(message, 'La faction a bien été modifié.');
        }
    },
    delete: {
        help: [
            'Permet de supprimer un clan.'
        ],
        args: '',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            Clans.deleteClan(clan);
            Utils.reply(message, 'Le clan a bien été supprimé.')
        }
    },
    setdesc: {
        help: [
            'Permet de modifier la description d\'un clan.'
        ],
        args: '<description>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            Clans.setDescription(clan, args.join(' '));
            Utils.reply(message, 'La description a bien été changée.');
        }
    },
    setimage: {
        help: [
            'Permet de modifier l\'image d\'un clan.'
        ],
        args: '<url>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            Clans.setImage(clan, args.join(' '));
            Utils.reply(message, 'L\'image a bien été changée.');
        }
    },
    setchannel: {
        help: [
            'Permet de modifier le channel ou le bot peut parler d\'un clan.'
        ],
        args: '<#channel>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            var channel = message.mentions.channels.first();
            if (!channel) {
                Utils.reply(message, "Vous devez mentionner le channel.");
                return;
            }
            Clans.setChannel(clan, channel);
            Utils.reply(message, 'Le channel a bien été changé.');
        }
    },
    getdynamicimage: {
        help: [
            'Permet d\'afficher l\'image dynamique du clan.'
        ],
        args: '<Clan>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            var totalPoints = Utils.getScoreOfClan(Players, clan.id, Clans);
            message.channel.send('L\'url de l\'image: ' + Constants.domain + '/images/clan?c=' + clan.id + '&s=' + totalPoints);
        }
    },
    getimageclan: {
        help: [
            'Permet d\'afficher l\'image du clan.'
        ],
        args: '<Clan>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            message.channel.send('L\'url de l\'image: ' + Constants.domain + '/images/clansimple?c=' + clan.id);
        }
    },
    setsmiley: {
        help: [
            'Permet de modifier le smiley d\'un clan.'
        ],
        args: '<:smiley:>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            Clans.setSmiley(clan, args.join(' '));
            Utils.reply(message, 'Le smiley a bien été changé.');
        }
    },
    addplayer: {
        help: [
            'Permet d\'ajouter un joueur dans un clan.'
        ],
        args: '<@player>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            var user = message.mentions.members.first();
            if (!user) {
                Utils.reply(message, "Vous devez mentionner une personne.");
                return;
            }
            var clanAdded = Clans.addPlayer(clan, user, "Ajout manuel de " + message.author.name, Players.getPsns(user.id).length > 0);
            if (!clanAdded) {
                Utils.reply(message, 'Le joueur est déjà dans un clan veuillez l\'enlever en premier.', true);
                return
            }
            if (Clans.getFaction(clan)) {
                user.addRole(message.guild.roles.get(Clans.getFaction(clan)), "faction automatique");
            }
            Players.setCooldown(user);
            Utils.reply(message, 'Le joueur a bien été ajouté dans le clan.');
        }
    },
    delplayer: {
        help: [
            'Permet de supprimer un joueur dans un clan.'
        ],
        args: '<@player>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            var user = message.mentions.members.first();
            if (!user) {
                Utils.reply(message, "Vous devez mentionner une personne.");
                return;
            }
            var clanRemoved = Clans.removePlayer(clan, user, "Supression manuel de " + message.author.name, Players.getPsns(user.id).length > 0);
            if (!clanRemoved) {
                Utils.reply(message, 'Le joueur n\'est pas dans ce clan.', true);
                return;
            }
            if (Clans.getFaction(clan)) {
                user.removeRole(message.guild.roles.get(Clans.getFaction(clan)), "Supression manuel (faction) de " + message.author.name);    
            }
            
            if (Constants.resetRankWhenChangeClan) {
                Players.setPoints(user.id, clanRemoved.id, 0);
            }
            Players.resetRank(user.id, clanRemoved);
            Utils.reply(message, 'Le joueur a bien été supprimé du clan.');
        }
    },
    setPs4Role: {
        help: [
            'Permet d\'ajouter le rôle ps4 au clan.'
        ],
        args: '<@role>',
        runCommand: (clan, args, message) => {
            if (!Clans.getClan(clan)) {
                Utils.reply(message, 'Aucun clan avec ce rôle.', true);
                return;
            }
            var role = message.mentions.roles.first();
            if (!role) {
                Utils.reply(message, 'Vous devez mentionner un rôle.', true);
                return;
            }
            Clans.setPs4Role(clan.id, role);
            Utils.reply(message,"Le rôle ps4 du clan a bien été modifié.");
        }
    }
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}clan <clan> ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des clans', "", message.author, fields);
}
module.exports = {
    role: 'CHANGE_NICKNAME',
    helpCat: 'Permet d\'administrer les clans',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("CHANGE_NICKNAME")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour administrer les clans", true);
            return;
        }
        if (args.length < 2) {
            help(message);
            return;
        }
        var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
        args = reg[2].trim().split(' ');
        var name = reg[1].replace(/"/g, '');
        var role = Clans.getRoleByName(name, message.channel.guild);
        if (!role) {
            Utils.reply(message, "Aucun rôle avec ce nom", true);
            return;
        }
        if (commands[args[0]]) {
            var label = args[0];
            args.shift();
            commands[label].runCommand(role, args, message);
        } else {
            help(message);
        }
    }
}