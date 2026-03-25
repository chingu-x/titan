const { base } = require('../handlers/airtable.js')

const getSoloProjectsByDiscordId = async (
    discordId,
    fields = ['*']
) => {
    try{
        const soloProjects = await base('Solo Projects').select({
            filterByFormula: `{Discord ID} = '${discordId}'`,
            fields
        }).firstPage();
        return soloProjects;
    }catch (e) {
        console.log("[getSoloProjectsByDiscrodId] error:", e)
    }
}

module.exports = {
    getSoloProjectsByDiscordId
}