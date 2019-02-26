const Discord = require('discord.js');
const Utils = require('../utils');
var Players = require('../models/players');
var Ranks = require('../models/ranks');
var Clans = require('../models/clans');
var Constants = require('../models/constants');
module.exports = {
	role: 'CHANGE_NICKNAME',
	helpCat: 'Permet de donner des points à un joueur.',
	help: function (message) {
		Utils.sendEmbed(message, 0x00AFFF, "Utilisation de la commande givepoints", "", message.author, [{
			title: Constants.prefix + 'givepoints <points>',
			text: "Permet de donner des points à un joueur.",
			grid: false
		}]);
	},
	runCommand: (args, message) => {

        if (!message.member.hasPermission("CHANGE_NICKNAME")) {
            Utils.reply(message, "Vous n'avez pas assez de couilles pour donner des points", true);
            return;
		}
		
		var members = message.mentions.members;
		if (members.array().length === 0) {
			Utils.reply(message, "Vous devez mentionnez au moins un utilisateur", true);
			return;
		}

		var points = Number(args[args.length - 1]);
		if (isNaN(points)) {
			Utils.reply(message, 'Le nombre de points doit être un nombre.', true);
			return;
		}

		members.forEach((member) => {
			var clanId = Clans.getPlayerClan(member).id;
			var player = Players.getPlayer(member.id, clanId)
			var oldPoints = 0;
			if (player)
				oldPoints = player.points;
			if (!oldPoints)
				oldPoints = 0;
			var newPoints = oldPoints + points
			var oldAllPoints = Players.getPointsOfAllTimes(member.id, clanId);
			Players.setPoints(member.id, clanId, newPoints);
			var newAllPoints = Players.getPointsOfAllTimes(member.id, clanId);
			var playerClan = Clans.getPlayerClan(member);
			var avaliabeRanks = Ranks.getRanks(playerClan.id);
			var keys = Ranks.getSortedKeys(playerClan.id);
			var nextRank = null;
			for (var i = 0; i < keys.length; i++) {
				if (avaliabeRanks[keys[i]].points > oldAllPoints && avaliabeRanks[keys[i]].points <= newAllPoints) {
					nextRank = avaliabeRanks[keys[i]];
				}
			}
			if (!nextRank) {
				return;
			}
			if (nextRank.points <= newAllPoints) {
				member.addRole(member.guild.roles.get(nextRank.roleId));
				Players.setActiveRank(member, nextRank);
				Utils.reply(message, `Bravo <@!${member.id}> tu as maintenant accès à un nouveau rang: **${nextRank.name}**.`);
			}
		});

		if (members.array().length > 1) {
			Utils.reply(message, 'Les points des joueurs ont bien été modifiés.');
		}
		else {
			Utils.reply(message, 'Les points du joueur ont bien été modifiés.');
		}
	}
}