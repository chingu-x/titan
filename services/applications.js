const { base } = require('../handlers/airtable.js')

const getApplicationsByDiscordId = async (
    discordId,
    fields = ['*']
) => {
    try{
        const applications = await base('Applications').select({
            filterByFormula: `{Discord ID} = '${discordId}'`,
            fields
        }).firstPage();
        return applications;
    }catch (e) {
        console.log("[getApplicationsByDiscrodId] error:", e)
    }
}

module.exports = {
    getApplicationsByDiscordId
}