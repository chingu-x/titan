import { base } from '../handlers/airtable.js';

// Get all voyage signups for a specific voyage for a member
const getCurrentVoyageSignupsByDiscordId = async (
    discordId,
    currentVoyage,
    fields = ['*']
) => {
    try {
        return await base('Voyage Signups').select({
            filterByFormula: `AND({Discord ID} = '${discordId}', {Voyage} = '${currentVoyage}')`,
            fields
        }).firstPage()
    } catch (e) {
        console.log("[getCurrentVoyageSignupsByDiscordId] error:", e)
    }

}

const getAllVoyageSignupsByDiscordId = async (
    discordId,
    fields = ['*']
) => {
    try {
        return await base('Voyage Signups').select({
            filterByFormula: `{Discord ID} = '${discordId}'`,
            fields
        }).firstPage()
    }catch (e) {
        console.log("[getAllVoyageSignupsByDiscordId] error:", e)
    }
}

export { getCurrentVoyageSignupsByDiscordId, getAllVoyageSignupsByDiscordId };
