var fs = require('fs');

var constants = {
    prefix: "_",
    pseudoModifier: "Bonjour",
    resetRankWhenChangeClan: true,
    leaveCooldown: 0,
    joinmessage: "no",
    leavemessage: "no",
    PS4: "[PS4]"
}

function save() {
    fs.writeFile("./data/constants.json", JSON.stringify(constants), function (err) {
        if (err) {
            return Utils.log(err, true);
        }
        Utils.log(`The ${Utils.Color.FgYellow}constants${Utils.Color.Reset} file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile('./data/constants.json', (err, data) => {
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
    get leavemessage() {
        return constants.leavemessage;
    },
    get PS4() {
        return constants.PS4;
    },
    get domain() {
        return constants.domain;
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
    }
};