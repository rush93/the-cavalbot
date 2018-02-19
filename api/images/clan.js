const Clans = require('../../models/clans');
const Players = require('../../models/players');
const Utils = require('../../utils');
var Jimp = require("jimp");
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
        Jimp.read(`img/${clan.id}.png`).then(function (image) {
            Jimp.loadFont(`fonts/font.fnt`).then(function (font) {
                image
                    .resize(300, 300)
                    .print(font, 150 - ((score.length * 27) / 2), 225, score)
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