const { base } = require('../handlers/airtable.js')

const getVoyageProjectsByDiscordId = async (
    voyageName,
    discordId,
    fields = ['*']
) => {
    try{
        const voyageProjects = await base('Voyage Projects').select({
            filterByFormula: `AND({Discord ID} = '${ discordId }', {Voyage} = '${ voyageName }')`,
            fields
        }).firstPage();
        return voyageProjects;
    }catch (e) {
        console.log("[getVoyageProjectsByDiscordId] error:", e)
    }
}

module.exports = {
    getVoyageProjectsByDiscordId
}