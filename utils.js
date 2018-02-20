const Discord = require('discord.js');
const moment = require('moment');
const Color = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
}
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
    getScoreOfClan: function(Players, clanId) {

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
    },
    getRolesOfPerm: function(guild, permissions) {
        var roles = guild.roles;
        var rolesKey = Object.keys(roles);
        var rolesWithPerm = [];
        for (var i = 0; i < rolesKey.length; i++) {
            if (roles.get(rolesKey[i]).hasPermission(permissions)) {
                rolesWithPerm.push(roles.get(rolesKey[i]));
            }
        }
        return rolesWithPerm;
    },
    log: function(text, err = false, place = null, by = null, content = null) {
        var toWrite = `${Color.FgCyan}[${moment().format('DD-MM-YYYY HH:mm:ss')}]:${Color.Reset}`;

        if (err) {
            toWrite += Color.BgRed;
        }
        toWrite += ` ${text} ${Color.Reset}`;
        if (place) {
            toWrite += ` in ${Color.FgYellow}${place}${Color.Reset}`;
        }
        if (by) {
            toWrite += ` by ${Color.FgGreen}${by}${Color.Reset}`;
        }
        if (content) {
            toWrite += `: ${Color.FgCyan}${content}${Color.Reset}`;
        }
        console.log(toWrite);
    },
    Color
}