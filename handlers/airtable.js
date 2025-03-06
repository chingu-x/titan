const Airtable = require('airtable');
require('dotenv').config();

const airtableBaseID = process.env.AIRTABLE_BASE;
const airtableAPIKey = process.env.AIRTABLE_API_KEY;
const adminTestID = process.env.ADMIN_TEST_ID;
const adminChatID = process.env.ADMIN_CHAT_ID;

const base = new Airtable({ apiKey: airtableAPIKey }).base(airtableBaseID);

module.exports = { 
    airtableBaseID, 
    airtableAPIKey,
    base,
    adminTestID,
    adminChatID
};