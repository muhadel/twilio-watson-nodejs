const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const AssistantV1 = require('ibm-watson/assistant/v1');
const { getAuthenticatorFromEnvironment } = require('ibm-watson/auth');
const { twilioNumber, twilioAccountSid, twilioAuthToken, myPhoneNumber, host, port, watson } = require('./keys');
const client = require('twilio')(twilioAccountSid, twilioAuthToken);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());

const sendWhatsappMessage = (to, message) => {
  client.messages
    .create({
      from: `whatsapp:${twilioNumber}`,
      body: message,
      to: to,
    })
    .then((message) => {
      console.log(message.sid);
    })
    .catch((err) => {
      console.log('error', err);
    });
};
app.get('/ping', (req, res) => {
  return res.json({ success: true, host, port, myPhoneNumber });
});
const getWatsonResponse = async (body) => {
  return new Promise((resolve, reject) => {
    const auth = getAuthenticatorFromEnvironment('ASSISTANT');
    const assistant = new AssistantV1({
      authenticator: auth,
      url: watson.assistantUrl,
      version: '2020-04-01',
    });
    // assistant.workspaceId = workspaceId;
    assistant
      .message({
        workspaceId: watson.workspaceId,
        input: { text: body },
      })
      .then((response) => {
        const watsonResponses = response.result.output.generic;
        let output = '';
        watsonResponses.forEach((response) => {
          if (response.response_type === 'text') {
            output += `${response.text}\n`;
          } else if (response.response_type === 'option') {
            response.options.forEach((item) => {
              output += `➜ ${item.label}\n`;
            });
          }
        });
        resolve(output);
      })
      .catch((err) => {
        console.log('error: ', err);
        reject('Error, Something went wrong!');
      });
  });
};
app.post('/smssent', async (req, res) => {
  console.log('Request', req.body);
  const { Body, From } = req.body;
  const output = await getWatsonResponse(Body);
  console.log('output', output);
  await sendWhatsappMessage(From, output);
  return res.send('');
});

app.listen(port, () => {
  console.log(`Listening on http://${host}:${port}/`);
});
