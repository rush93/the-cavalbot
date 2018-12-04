const repeatMessage = (Messages, guild) => {
  setTimeout(() => {
    const allMessages = Messages.getAll();
    for (const key in allMessages) {
      const message = allMessages[key];
      var diff = 0;
      if (message.lastRun) {
        diff = (new Date().getTime()) - message.lastRun;
      } else {
        message.lastRun = new Date().getTime();
        Messages.editMessage(key, message);
      }
      if (diff > message.time) {
        guild.channels.get(message.channelId).send(message.message);
        message.lastRun = new Date().getTime();
        Messages.editMessage(key, message);
      }
    }
    repeatMessage(Messages, guild);
  }, 1000); 
}

module.exports = function init(Messages, guild) {
  repeatMessage(Messages, guild);
}