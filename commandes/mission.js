/*diff = facile/moyen/diff/impossible
_mission    information //affiche mission en cours ou propose commande demandeMission
            demandeMission  diff
            demandeMissionGroupe diff
            history soi meme ou @personne
            vérification lienimage

            //status : 0 = en cours, 1=validé, -1 = temps écoulé, 2 = en attende validation
*/
const Discord = require('discord.js');
const Utils = require('../utils');
var Constants = require('../models/constants');
var Mission = require('../models/mission');
var Players = require('../models/players');
var Clans = require('../models/clans');
var Ranks = require('../models/ranks');
var moment = require('moment');
var givepointsCommands = require('./givepoints');

var commands = {
    create: {
        help: [
            'Permet de créer une mission.'
        ],
        args: '',
        runCommand: (args, message) => {
            if (!message.member.hasPermission("KICK_MEMBERS")) {
                Utils.reply(message, "Vous n'avez pas assez de couilles pour modifier les missions", true);
                return;
            }
            if (args.length < 3) {
                Utils.reply(message, 'Il manque des arguments. (desc, difficulte, mode, hero)');
                return;
            }
            var reg = /("[^"]+"|[^ ]+)((?: [^ ]+)+)/g.exec(args.join(' '));
            args = reg[2].trim().split(' ');
            var desc = reg[1].replace(/"/g, '');
            Mission.createMission(desc, args[0],args[1],args[2],args[3]);
            Utils.reply(message, 'La mission a bien été crée.')
        }
    },
    information: {
        help: [
            'Permet de voir les informations sur la mission en cours'
        ],
        args: '',
        runCommand: (args, message) => {
            var retour = Players.getCurrentMission(message);
            if (retour == -1) {
                Utils.reply(message, "pas de mission active");
            }else{
                Utils.reply(message, retour);
            }
        }
    },
    demandeMission: {
        help: [
            'permet de demander une mission'
        ],
        args: 'difficulte',
        runCommand: (args, message) => {
            //vérifier si derniere mission pas fini il y a 5minutes
            var lastTempsMissionValider = Players.getLastTempsMissionValider(message);
            if(moment(lastTempsMissionValider).day(7).format('MM/DD/YYYY') == moment().day(7).format('MM/DD/YYYY')){
                Utils.reply(message, "Veuillez attendre dimanche 00h pour demander une autre mission");
            }else{
                var retour = Players.addMission(message,args[0]);
                var tempsMissionActive = Players.getTempsMission(message);
                if(retour == -1){
                    // vérifier si mission active/vérif mais 7 jours écoulé depuis old demande
                    if (moment() - moment(tempsMissionActive).add(7, 'days') < 0)
                    {
                        Utils.reply(message, 'vous avez deja une missions active ou en cours de validation');
                    }else{
                        // set a -1 si temps passé
                        Players.setTimeoutMission(message);
                        var retour = Players.addMission(message,args[0]);
                        Utils.reply(message, "Voici votre mission : \n"+retour);
                    }
                }else if(retour == -2){
                    Utils.reply(message, 'La difficulté que vous avez choisi n\'existe pas faite _mission list');
                }else{
                    
                    Utils.reply(message, "Voici votre mission : \n"+retour);
                }
            }
        }
    },
    /*modifierEtat: {
        help: [
            'activer(true) ou dé-activer(false) une catégorie de mission (ex : hallowen)'
        ],
        args: 'nomEvent true/false',
        runCommand: (args, message) => {
            if (args.length < 2) {
                Utils.reply(message, 'Il manque un ou des arguments. (nomEvent true/false)');
                return;
            }
            if (args[1] == true || args[1] == false) {
                Mission.modifEtat(args[0],args[1]);
                Utils.reply(message, 'L\'etat a bien été modifié.')
            }else{
                Utils.reply(message, '2eme arguments non valide, veuillez indiquez true ou false.')
            }
            
        }
    },*/
    list: {
        help: [
            'affiche la list des missions'
        ],
        args: 'difficulté',
        runCommand: (args, message) => {
            var listMissions = Mission.getMissions();
            var keys = Object.keys(listMissions);
            var fields = [];
            var fieldsTry = [];
            var difficulte = [];

            for (var i = 0; i < keys.length; i++) {
                if (listMissions[i].event==null) {
                    if (difficulte[listMissions[i].difficulte]==null) {
                        difficulte[listMissions[i].difficulte] = 1;
                    }else{
                        difficulte[listMissions[i].difficulte]++;
                    }
                }else{
                    if (difficulte[listMissions[i].event]==null) {
                        difficulte[listMissions[i].event] = 1;
                    }else{
                        difficulte[listMissions[i].event]++;
                    }
                    
                }
                
            }
            var keysDiff = Object.keys(difficulte);
            for (var i = 0; i < keysDiff.length; i++) {
                fields.push({
                    title: keysDiff[i],
                    text: difficulte[keysDiff[i]],
                    grid: false
                });
            }
            if (args < 1) {
                Utils.sendEmbed(message, 0xE8C408, "Missions par difficulté", "", message.author, fields);
            }else{
                for (var i = 0; i < keys.length; i++) {
                    if (listMissions[keys[i]].difficulte == args[0]) {
                        fieldsTry.push({
                            title: i,
                            text: listMissions[keys[i]].nom,
                            grid: false
                        });
                    } else if(listMissions[keys[i]].event == args[0]){
                        var active;
                        if (listMissions[keys[i]].active) {
                            active = oui;
                        }else{
                            acrive = non;
                        }
                        fieldsTry.push({
                            title: i,
                            text: listMissions[keys[i]].nom + " active : "+active,
                            grid: false
                        });
                    }
                }
                if (Object.keys(fieldsTry).length == 0) {
                    Utils.reply(message, 'Pas de mission pour cette catégorie');
                }else{
                    Utils.sendEmbed(message, 0xE8C408, "Missions "+args[0], "", message.author, fieldsTry);
                }
            }
            
        }
    },
    history: {
        help: [
            'affiche l\'history des missions d\'un joueur'
        ],
        args: '@joueur',
        runCommand: (args, message) => {
            var retour = -1;
            if (args<1) {//historique de celui qui fait la commande
                retour = Players.getHistoryMission(message,message.member);
            }else{
                var user = message.mentions.members.first();
                retour = Players.getHistoryMission(message,user);
            }
            if (retour == -1) {
                Utils.reply(message, 'Pas d\'historique de mission');
            }
        }
    },
    verification: {
        help: [
            'demander a valider une mission'
        ],
        args: '',
        runCommand: (args, message) => {
            if (args.length >= 1) {
                var channel = message.guild.channels.get(Constants.missionChannel);
                //vérifier si mission en cours ou en attente validation
                var retour = Players.getCurrentMission(message);
                if(Players.getCurrentValidation(message) == 1){
                    Utils.reply(message, 'Vous avez deja envoyé une capture d\'écran');
                }else if (retour == -1) {
                    Utils.reply(message, "Pas de mission active");
                }else{
                    channel.send(retour+ "\nLien image : " +args + "\nValider mission : _mission valider "+message.member.id+"\nRefuser mission : _mission refuser "+message.member.id+"\n"+`<@301080434949881856>`);
                    Players.setValidation(message);//modifier statut = 0 en statut = 2
                    Utils.reply(message, 'Veuillez attendre la validation par les autorités compétentes');
                }
                
            }else{
                Utils.reply(message, 'Veuillez insérer le lien de votre image justificative (capture d\'écran non découpée)');
            }
        }
    },
    valider: {
        help: [
            'valider une mission'
        ],
        args: '',
        runCommand: (args, message) => {
            if (!message.member.hasPermission("KICK_MEMBERS")) {
                Utils.reply(message, "Vous n'avez pas assez de couilles pour modifier les missions", true);
                return;
            }
            if (args.length >= 1) {
                var retour = Players.setValider(args[0]);
                if (retour != -1) {
                    message.guild.channels.get(Constants.retourMissionChannel).send(`<@`+args[0]+`> GG! mission validé, tu viens de gagner `+retour+" points");

                    var points = Number(retour);
                    var member = message.guild.members.get(args[0]);
                    var clanId = Clans.getPlayerClan(member).id;
                    var player = Players.getPlayer(member.id, clanId)
                    var oldPoints = 0;
                    if (player)
                        oldPoints = player.points;
                    if (!oldPoints)
                        oldPoints = 0;
                    var newPoints = Number(oldPoints) + Number(points);
                    console.log("newPoints :"+newPoints);
                    Players.setPoints(member.id, clanId, newPoints);
                    Utils.reply(message, 'Les points du joueur ont bien été modifiés.');
                    var playerClan = Clans.getPlayerClan(member);
                    var avaliabeRanks = Ranks.getRanks(playerClan.id);
                    var keys = Ranks.getSortedKeys(playerClan.id);
                    var nextRank = null;
                    for (var i = 0; i < keys.length; i++) {
                        if (avaliabeRanks[keys[i]].points > oldPoints && avaliabeRanks[keys[i]].points <= newPoints) {
                            nextRank = avaliabeRanks[keys[i]];
                        }
                    }
                    if (!nextRank) {
                        return;
                    }
                    if (nextRank.points <= newPoints) {
                        member.addRole(member.guild.roles.get(nextRank.roleId));
                        Players.setActiveRank(member, nextRank);
                        message.guild.channels.get(Constants.retourMissionChannel).send(`Bravo <@!${member.id}> tu as maintenant accès à un nouveau rang: **${nextRank.name}**.`);
                    }
                }else{
                    Utils.reply(message, 'heu on dirai que cette personne n\'a pas de mission en attente de validation');
                }
            }else{
                Utils.reply(message, 'Fail copier coller');
            }
        }
    },
    refuser: {
        help: [
            'refuser une mission'
        ],
        args: '',
        runCommand: (args, message) => {
            if (!message.member.hasPermission("KICK_MEMBERS")) {
                Utils.reply(message, "Vous n'avez pas assez de couilles pour modifier les missions", true);
                return;
            }
            if (args.length >= 1) {
                var retour = Players.setUnValider(args[0]);
                if (retour == 1) {
                    message.guild.channels.get(Constants.retourMissionChannel).send(`<@!`+args[0]+`> screen pour votre mission refusé`);
                    Utils.reply(message, 'Mission refuser avec succes');
                }else{
                    Utils.reply(message, 'heu on dirai que cette personne n\'a pas de mission en attente de validation');
                }
            }else{
                Utils.reply(message, 'Fail copier coller');
            }
        }
    },
    points: {
        help: [
            'afficher le tableau des récompense'
        ],
        args: '',
        runCommand: (args, message) => {
            var embed = new Discord.RichEmbed({});
            embed.setColor(0x00AFFF);
            embed.setImage("https://cdn.discordapp.com/attachments/429572880045572096/502588044902400010/unknown.png");
            return message.channel.send("", embed);
        }
    }
}
var help = function (message) {
    var keys = Object.keys(commands);
    var fields = [];
    keys.forEach((command, index) => {
        fields.push({
            text: commands[command].help,
            title: `${Constants.prefix}mission ${command} ${commands[command].args}`,
            grid: false
        });
    });
    Utils.sendEmbed(message, 0x00AFFF, 'Liste des commandes des missions', "", message.author, fields);
}
module.exports = {
    role: 'MANAGE_GUILD',
    helpCat: 'Permet d\'obtenir une mission',
    help,
    runCommand: (args, message) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour jouer avec les missions (pas encore)", true);
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