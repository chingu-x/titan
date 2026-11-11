const { base } = require('../handlers/airtable.js')

const getDemoDaySignupsByDiscordId = async (
    voyageName,
    discordId,
    fields = ['*']
) => {
    try{
        const demoDaySignups = await base('Demo Day Signups').select({
            filterByFormula: `AND({Discord ID (from Application link)} = '${ discordId }', {What is your Voyage?} = '${ voyageName }')`,
            fields
        }).firstPage();
        return demoDaySignups;
    }catch (e) {
        console.log("[getDemoDaySignupsByDiscordId] error:", e)
    }
}

module.exports = {
    getDemoDaySignupsByDiscordId
}