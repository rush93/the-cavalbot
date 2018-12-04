var fs = require('fs');

var messages = [ ];

function save() {
    fs.writeFile(__dirname + "/../data/messages.json", JSON.stringify(messages), function (err) {
        if (err) {
            return console.log(err, true);
        }
        console.log(`The messages file was saved!`);
    });
}

function load() {
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../data/messages.json', (err, data) => {
            if (err) return;
            messages = JSON.parse(data);
            resolve(messages);
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
    addMessage: function(message) {
      messages.push(message);
      save();
    },
    deleteMessage: function(index) {
      messages.splice(index, 1);
      save();
    },
    editMessage: function(index, message) {
      messages[index] = message;
      save();
    },
    getMessage: function(index) {
      return messages[index];
    },
    getAll: function() {
      return messages;
    }
};