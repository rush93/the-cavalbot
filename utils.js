
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
const ReactMap = {
    0: "one",
    1: "two",
    2: "three",
    3: "four",
    4: "five",
    5: "six",
    6: "seven",
    7: "eight",
    8: "nine",
    9: "keycap_ten",
    10: "regional_indicator_a",
    11: "regional_indicator_b",
    12: "regional_indicator_c",
    13: "regional_indicator_d",
    14: "regional_indicator_e",
    15: "regional_indicator_f",
    16: "regional_indicator_g",
    17: "regional_indicator_h",
    18: "regional_indicator_i",
    19: "regional_indicator_j",
    20: "regional_indicator_k",
    21: "regional_indicator_l",
    22: "regional_indicator_m",
    23: "regional_indicator_n",
    24: "regional_indicator_o",
    25: "regional_indicator_p",
}
const ConfirmReact = 'white_check_mark';

const UnicodeReactMap = {
    0: `1⃣`,
    1: `2⃣`,
    2: `3⃣`,
    3: `4⃣`,
    4: `5⃣`,
    5: `6⃣`,
    6: `7⃣`,
    7: `8⃣`,
    8: `9⃣`,
    9: `🔟`,
    10: `🇦`,
    11: `🇧`,
    12: `🇨`,
    13: `🇩`,
    14: `🇪`,
    15: `🇫`,
    16: `🇬`,
    17: `🇭`,
    18: `🇮`,
    19: `🇯`,
    20: `🇰`,
    21: `🇱`,
    22: `🇲`,
    23: `🇳`,
    24: `🇴`,
    25: `🇵`,
}
const UnicodeConfirmReact = '✅';
const UnicodeCancelReact = '❌';
var Constants = require('./models/constants');

var getClanScores = function (Players, Clans) {
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
    var scoreKeys = Object.keys(scores);
    for (var i = 0; i < scoreKeys.length; i++) {
        var clan = Clans.getClanById(scoreKeys[i]);
        if (clan != undefined) {
            if ( clan && clan.ps4Role && clan.ps4Role != scoreKeys[i] && scores[clan.ps4Role]) {
                scores[scoreKeys[i]] += scores[clan.ps4Role];
            }
            
            var tmp = Clans.getPointsOfLastSeason(scoreKeys[i]);
            scores[scoreKeys[i]] -= tmp;
        }
    }
    return scores;
}
var sendEmbedInChannel = function (channel, color, title, content, author, fields, image = null, maxField = 25) {
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
        return channel.send("", embed);
    }
    for (var i = 0; i < fields.length; i++) {
        if (i % maxField === 0) {
            if (embed) {
                channel.send("", embed);
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
    return channel.send("", embed);
}
var recurciveReactNbTime = function (message, nb, current, withConfirm = false, withCancel = false, ignoreReact = []) {
    var then = () => {
        if(current + 1 !== nb) {
            recurciveReactNbTime(message, nb, current + 1, withConfirm, withCancel);
            return;
        }
        if (withConfirm) {
            message.react(UnicodeConfirmReact).then(() => {
                if (withCancel) {
                    message.react(UnicodeCancelReact);
                }
            });
            return;
        }
        if (withCancel) {
            message.react(UnicodeCancelReact);
        }
    }
    if (ignoreReact.indexOf(current) >= 0) {
        then();
        return;
    }
    message.react(UnicodeReactMap[current]).then(then);
}
module.exports = {
    reply: function (message, toSend, error) {
        var embed = new Discord.RichEmbed({});
        embed.setColor(error ? 0xA80000 : 0x00AFFF);
        embed.setDescription(toSend);
        embed.setFooter(message.author.username + "#" + message.author.discriminator, message.author.avatarURL);
        return message.channel.send("", embed);
    },
    sendDM: function (user, toSend, error) {
        var embed = new Discord.RichEmbed({});
        embed.setColor(error ? 0xA80000 : 0x00AFFF);
        embed.setDescription(toSend);
        embed.setFooter(user.username + "#" + user.discriminator, user.avatarURL);
        return user.send("", embed);
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
    sendEmbed: function (message, color, title, content, author, fields, image = null, maxField) {
        return sendEmbedInChannel(message.channel, color, title, content, author, fields, image, maxField);
    },
    sendDmEmbed: function(user, color, title, content, author, fields, image = null, maxField) {
        return sendEmbedInChannel(user, color, title, content, author, fields, image, maxField);
    },
    sendEmbedInChannel,
    replaceModifier: function (input, clan, guildMember, player, rank, isPS4, ps4text, withHightLight = true, withoutPlayer = false, playerNickname = null) {
        var playerName = `<@!${guildMember.id}>`;
        var clanName = clan ? guildMember.guild.roles.get(clan.id).name : null;
        if (!withHightLight) {
            if(!playerNickname) {
                playerName = '%player%';
            } else {
                playerName = playerNickname;
            }
            clanName = clan ? guildMember.guild.roles.get(clan.id).name : null;
        }
        if(!withoutPlayer) {
            input = input.replace(/%player%/gi, playerName);
        }
        replaceSomething = false;
        if (player) {
            input = input.replace(/%rank%/gi, player.activeRank ? player.activeRank.displayName : '');
            replaceSomething = player.activeRank ? true : false;
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
    getUsernameRegex(patern) {
        var restrictedChar = ["\\","^","$","(",")","|","+",".","*","[","]","-","?","/"]
        var result = "";
        var paternArr = patern.split('%player%');
        for (var i = 0; i < paternArr[0].length; i++) {
            var char = paternArr[0].charAt(i);
            if (restrictedChar.indexOf(char) > -1) {
                char = '\\' + char;
            }
            char = `(?:${char}|$)`
            result+=char;
        }
        result+='(.+)';
        if(paternArr[1]) {
            for (var i = 0; i < paternArr[1].length; i++) {
                var char = paternArr[1].charAt(i);
                if (restrictedChar.indexOf(char) > -1) {
                    char = '\\' + char;
                }
                if (i>=3) {
                    char = `(?:${char}|$)`
                }
                result+=char;
            }
        }
        return result;
    },
    getClanScores,
    getScoreOfClan: function(Players, clanId, Clans) {
        var scores = getClanScores(Players, Clans);
        if (Clans.getClanById(clanId).ps4Role === clanId) {
            clanId = Clans.getClanById(clanId).id;
        }
        return scores[clanId];
    },
    getRolesOfPerm: function(guild, permissions) {
        var roles = guild.roles;
        var rolesKey = roles.keyArray();
        var rolesWithPerm = [];
        for (var i = 0; i < rolesKey.length; i++) {
            if (roles.get(rolesKey[i]).hasPermission(permissions) && !roles.get(rolesKey[i]).managed) {
                rolesWithPerm.push(roles.get(rolesKey[i]));
            }
        }
        return rolesWithPerm;
    },
    log: function(text, err = false, place = null, by = null, content = null, guild = null) {
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
        
        if(guild && Constants.logChannel != ""){
            var channel = guild.channels.get(Constants.logChannel);//salon test : 448515012441669632 //vrai salon : 448527311336112139
            var chaine = text;
            if (place) {
                chaine += ` in `+place;
            }
            if (by) {
                chaine += ` by `+by;
            }
            if (content) {
                chaine += ` : `+content;
            }
            channel.send(chaine);
        }
        // if(err) {
        //     console.log(console.trace());
        // }
    },
    reactNbTime(message, nb, withConfirm = false, withCancel = false, ignoreReact = []) {
        recurciveReactNbTime(message, nb, 0, withConfirm, withCancel, ignoreReact);
    },
    Color,
    ReactMap,
    ConfirmReact,
    UnicodeReactMap,
    UnicodeConfirmReact,
    UnicodeCancelReact,
    InvertedUnicodeReactMap: function () {
        var ret = {};
        for(var key in UnicodeReactMap){
          ret[UnicodeReactMap[key]] = key;
        }
        return ret;
    },
    removeMyReact: function (message) {
        message.reactions.forEach(reaction => {
            reaction.remove();
        });

    }
}