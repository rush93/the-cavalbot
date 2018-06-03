const projectId = 'small-talk-9b89f'; // mon id a remplacer si vous faites votre agent
const sessionId = 'quickstart-session-id';
const languageCode = 'fr';
const Utils = require('./utils');

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'dialogflow-credentials.json'
  });

const sessions = {}

module.exports =  (author, message) => {
    if (!sessions[author.id]) {
        sessions[author.id] = sessionClient.sessionPath(projectId, author.id + Math.random().toString(36).substr(2));
    }
    const request = {
        session: sessions[author.id],
        queryInput: {
          text: {
            text: message,
            languageCode: languageCode,
          },
        },
      };
    return new Promise((resolve, reject) => {
        sessionClient
        .detectIntent(request)
        .then(responses => {
            const result = responses[0].queryResult;
            Utils.log('', false, 'DM message of ' + author.username, 'The-cavalbot', result.fulfillmentText);
            resolve(result.fulfillmentText);
            
        })
        .catch(err => {
            reject(err);
        })
    });
};