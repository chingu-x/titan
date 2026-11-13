import { base } from '../handlers/airtable.js';

const getVoyageProjectsByDiscordId = async (voyageName, discordId, fields = ['*']) => {
    try {
        const voyageProjects = await base('Voyage Projects').select({
            filterByFormula: `AND({Discord ID (from Application link)} = '${discordId}', {What is your Voyage?} = '${voyageName}')`,
            fields
        }).firstPage();
        return voyageProjects;
    } catch(e) { console.log("[getVoyageProjectsByDiscordId] error:", e) }
}

export { getVoyageProjectsByDiscordId };
