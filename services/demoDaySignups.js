import { base } from '../handlers/airtable.js';

const getDemoDaySignupsByDiscordId = async (voyageName, discordId, fields = ['*']) => {
    try {
        const demoDaySignups = await base('Demo Day Signup').select({
            filterByFormula: `AND({Discord ID (from Application link)} = '${discordId}', {Voyage} = '${voyageName}')`,
            fields
        }).firstPage();
        return demoDaySignups;
    } catch(e) { console.log("[getDemoDaySignupsByDiscordId] error:", e) }
}

export { getDemoDaySignupsByDiscordId };
