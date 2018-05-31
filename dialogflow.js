const projectId = 'small-talk-9b89f'; // mon id a remplacer si vous faites votre agent
const sessionId = 'quickstart-session-id';
const languageCode = 'fr-FR';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'dialogflow-credentials.json'
  });

const sessions = {}

module.exports =  (userId, message) => {
    if (!sessions[userId]) {
        sessions[userId] = sessionClient.sessionPath(projectId, userId);
    }
    const request = {
        session: sessions[userId],
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
            resolve(result.fulfillmentText);
        })
        .catch(err => {
            reject(err);
        })
    });
};