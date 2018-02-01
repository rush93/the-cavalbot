const Discord = require('discord.js');

module.exports = {
    reply: function (message, toSend, error) {
        var embed = new Discord.RichEmbed({});
        embed.setColor(error ? 0xA80000 : 0x00AFFF);
        embed.setDescription(toSend);
        embed.setFooter(message.author.username + "#" + message.author.discriminator, message.author.avatarURL);
        message.channel.send("",embed);
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
    sendEmbed: function(message, color, title, content, author, fields, image = null) {
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
            if (i%10 === 0) {
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
    replaceModifier: function (input, clan, guildMember, player, rank, withHightLight = true) {
        var playerName = `<@!${guildMember.id}>`;
        var clanName = `<@&${clan.id}>`;
        if (!withHightLight) {
            playerName = guildMember.user.username;
            clanName = guildMember.guild.roles.get(clan.id).name;
        }
        input = input.replace(/%player%/g, playerName);
        if (player) {
            input = input.replace(/%rank%/g, player.activeRank ? player.activeRank.displayName : '');
        
        }
        if (rank) {
            input = input.replace(/%srank%/g, rank.smiley);
        }
        input = input.replace(/%clan%/g, clanName);
        input = input.replace(/%sclan%/g, clan.smiley);

        return input;
    }
}