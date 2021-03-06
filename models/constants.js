var fs = require('fs');

var constants = {
    prefix: "_",
    pseudoModifier: "Bonjour",
    resetRankWhenChangeClan: true,
    guildID: "",
    logChannel: "",
    retourMissionChannel: "",
    bvnChannel: "",
    missionChannel: "",
    leaveCooldown: 0,
    joinmessage: "no",
    leavemessage: "no",
    PS4: "[PS4]",
    season: 0,
    reportChannel: null
}

function save() {
    fs.writeFile(__dirname + "/../data/constants.json", JSON.stringify(constants), function (err) {
        if (err) {
            return console.log(err, true);
        }
        console.log(`The constants file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../data/constants.json', (err, data) => {
            if (err) return;
            constants = JSON.parse(data);
            resolve(constants);
        });
    })
}

module.exports = {
    init: function () {
        return new Promise((resolve, reject) => {
            load()
                .then(r => resolve(r))
                .catch(e => reject(e));
        });
    },
    get prefix() {
        return constants.prefix;
    },
    get guildID() {
        return constants.guildID;
    },
    get logChannel() {
        return constants.logChannel;
    },
    get bvnChannel() {
        return constants.bvnChannel;
    },
    get missionChannel() {
        return constants.missionChannel;
    },
    get retourMissionChannel() {
        return constants.retourMissionChannel;
    },
    get pseudoModifier() {
        return constants.pseudoModifier;
    },
    get resetRankWhenChangeClan() {
        return constants.resetRankWhenChangeClan;
    },
    get leaveCooldown() {
        return constants.leaveCooldown;
    },
    get joinmessage() {
        return constants.joinmessage;
    },
    get mariageCooldown() {
        return constants.mariageCooldown;
    },
    get leavemessage() {
        return constants.leavemessage;
    },
    get PS4() {
        return constants.PS4;
    },
    get domain() {
        return constants.domain;
    },
    get season() {
        return constants.season ? constants.season : 0;
    },
    get reportChannel() {
        return constants.reportChannel;
    },
    set prefix(prefix) {
        constants.prefix = prefix;
        save();
        return constants.prefix;
    },
    set pseudoModifier(pseudoModifier) {
        constants.pseudoModifier = pseudoModifier;
        save();
        return constants.pseudoModifier;
    },
    set guildID(guildID) {
        constants.guildID = guildID;
        save();
        return constants.guildID;
    },
    set logChannel(logChannel) {
        constants.logChannel = logChannel;
        save();
        return constants.logChannel;
    },
    set retourMissionChannel(retourMissionChannel) {
        constants.retourMissionChannel = retourMissionChannel;
        save();
        return constants.retourMissionChannel;
    },
    set bvnChannel(bvnChannel) {
        constants.bvnChannel = bvnChannel;
        save();
        return constants.bvnChannel;
    },
    set missionChannel(missionChannel) {
        constants.missionChannel = missionChannel;
        save();
        return constants.missionChannel;
    },
    set resetRankWhenChangeClan(resetRankWhenChangeClan) {
        constants.resetRankWhenChangeClan = resetRankWhenChangeClan;
        save();
        return constants.resetRankWhenChangeClan;
    },
    set leaveCooldown(leaveCooldown) {
        constants.leaveCooldown = leaveCooldown;
        save();
        return constants.leaveCooldown;
    },
    set joinmessage(joinmessage) {
        constants.joinmessage = joinmessage;
        save();
        return constants.joinmessage;
    },
    set leavemessage(leavemessage) {
        constants.leavemessage = leavemessage;
        save();
        return constants.leavemessage;
    },
    set PS4(ps4) {
        constants.PS4 = ps4;
        save();
        return constants.PS4;
    },
    set domain(domain) {
        constants.domain = domain;
        save();
        return constants.domain;
    },
    set season(season) {
        constants.season = season;
        save();
        return constants.season;
    },
    set reportChannel(reportChannel) {
        constants.reportChannel = reportChannel;
        save();
        return constants.reportChannel;
    }
};