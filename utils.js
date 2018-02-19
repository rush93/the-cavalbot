const Discord = require('discord.js');

module.exports = {
    reply: function (message, toSend, error) {
        var embed = new Discord.RichEmbed({});
        embed.setColor(error ? 0xA80000 : 0x00AFFF);
        embed.setDescription(toSend);
        embed.setFooter(message.author.username + "#" + message.author.discriminator, message.author.avatarURL);
        message.channel.send("", embed);
    },
    getHightRole: function (roles) {
        var hight;
        roles.every(function (role) {
            if (!hight || hight.comparePositionTo(role) > 0) {
                hight = role;
            }
        });
        return hight;
    },
    canExecuteOn: function (author, user) {
        return getHightRole(author.roles).comparePositionTo(getHightRole(user.roles)) >= 0;
    },
    sendEmbed: function (message, color, title, content, author, fields, image = null) {
        var embed;
        if (fields.length === 0) {

            embed = new Discord.RichEmbed({});
            embed.setColor(color);
            embed.setTitle(title);
            embed.setDescription(content);
            if (image) {
                embed.setThumbnail(image);
            }
            embed.setFooter(author.username + "#" + author.discriminator, author.avatarURL);
            message.channel.send("", embed);
            return;
        }
        for (var i = 0; i < fields.length; i++) {
            if (i % 10 === 0) {
                if (embed) {
                    message.channel.send("", embed);
                    embed = null;
                }
                embed = new Discord.RichEmbed({});
                embed.setColor(color);
                embed.setTitle(title);
                embed.setDescription(content);
                if (image) {
                    embed.setThumbnail(image);
                }
                embed.setFooter(author.username + "#" + author.discriminator, author.avatarURL);
            }
            embed.addField(fields[i].title, fields[i].text, fields[i].grid);
        }
        message.channel.send("", embed);
    },
    replaceModifier: function (input, clan, guildMember, player, rank, isPS4, ps4text, withHightLight = true) {
        var playerName = `<@!${guildMember.id}>`;
        var clanName = clan ? guildMember.guild.roles.get(clan.id).name : null;
        if (!withHightLight) {
            playerName = guildMember.user.username;
            clanName = clan ? guildMember.guild.roles.get(clan.id).name : null;
        }
        input = input.replace(/%player%/gi, playerName);
        replaceSomething = false;
        if (player) {
            input = input.replace(/%rank%/gi, player.activeRank ? player.activeRank.displayName : '');
            replaceSomething = true;
        } else {
            input = input.replace(/%rank%/gi, '');
        }
        if (rank && rank.smiley) {
            input = input.replace(/%srank%/gi, rank.smiley);
            replaceSomething = true;
        } else {
            input = input.replace(/%srank%/gi, '');
        }
        if (clanName) {
            input = input.replace(/%clan%/gi, clanName);
        } else {
            input = input.replace(/%clan%/gi, '');
        }
        if (clan && clan.smiley) {
            input = input.replace(/%sclan%/gi, clan.smiley);
        } else {
            input = input.replace(/%sclan%/gi, '');
        }

        input = input.replace(/%PS4%/gi, isPS4 ? ps4text : '');
        if (!withHightLight && !replaceSomething ) {
            return isPS4 ? playerName + ' ' +  ps4text : playerName;
        }
        return input;
    },
    getScoreOfClan(Players, clanId) {

        var scores = {};
        var players = Players.getPlayers();
        var PlayerKeys = Object.keys(players);
        for (var i = 0; i < PlayerKeys.length; i++) {
            var objectKeys = Object.keys(players[PlayerKeys[i]].clans);
            for (var j = 0; j < objectKeys.length; j++) {
                if (typeof(players[PlayerKeys[i]].clans[objectKeys[j]]) === "object") {
                    if (!scores[objectKeys[j]]) {
                        scores[objectKeys[j]] = 0;
                    }
                    if (players[PlayerKeys[i]].clans[objectKeys[j]]) {
                        scores[objectKeys[j]]+= players[PlayerKeys[i]].clans[objectKeys[j]].points;
                    }
                }
            }
        }

        return scores[clanId];
    }
}