require('dotenv').config();
require('dotenv').config({ path: './ibm-credentials.env' });

module.exports = {
  twilioNumber: process.env.TWILIO_NUMBER,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  myPhoneNumber: process.env.MY_PHONE_NUMBER,
  host: process.env.HOST,
  port: process.env.PORT,
  watson: {
    assistantUrl: process.env.ASSISTANT_URL,
    workspaceId: process.env.WORKSPACE_ID,
  },
};
