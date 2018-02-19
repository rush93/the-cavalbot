const Clans = require('../../models/clans');
const Players = require('../../models/players');
const Utils = require('../../utils');
var Jimp = require("jimp");
var fs = require('fs');

var guild;
module.exports = {
    route: '/images/clan',
    method: 'get',
    init: (discordGuild) => {
        guild = discordGuild;
    },
    exec: (req, res) => {
        var clan = Clans.getRole(req.query.c, guild);
        if (!clan) {
            res.render('index', { message: 'Le clan est incorrect' });
            return;
        }
        var score = Utils.getScoreOfClan(Players, clan.id) + '';
        if (fs.existsSync(`img/generated/${clan.id}_${score}.png`)) {
            console.log(__dirname);
            var path = require(`path`);
            res.sendFile(path.resolve(`img/generated/${clan.id}_${score}.png`));
            return;
        }
        Jimp.read(`img/${clan.id}.png`).then(function (image) {
            Jimp.loadFont(`fonts/font.fnt`).then(function (font) {
                image
                    .resize(300, 300)
                    .print(font, 150 - ((score.length * 27) / 2), 225, score)
                    .write(`img/generated/${clan.id}_${score}.png`)
                    .getBuffer(Jimp.MIME_PNG, function(err, buffer){
                    res.set("Content-Type", Jimp.MIME_PNG);
                        res.send(buffer);
                    });
            }).catch((err) => {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        });
    }
};