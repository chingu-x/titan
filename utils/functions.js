const {base} = require("../handlers/airtable");
const {getCurrentVoyageSignups} = require("../services/voyages");
const {getApplicationsByDiscordId} = require("../services/applications");

async function getVoyages() {
    const voyages = await base('Schedules').select({
        view: 'Voyages',
        fields: ['Name', 'Start Date', 'End Date']
    }).firstPage();

    return voyages.map(voyage => ({
        number: voyage.fields['Name'],
        startDate: new Date(voyage.fields['Start Date']),
        endDate: new Date(voyage.fields['End Date'])
    })).filter(voyage =>
        voyage.number !== 'V999' &&
        voyage.number !== 'V99' &&
        voyage.number[0] !== 'X'
    ).sort((a, b) => a.startDate - b.startDate);
}

async function getCurrentAndNextVoyage() {
    const voyages = await getVoyages();
    const currentDate = new Date();

    let currentVoyage = null;
    let nextVoyage = null;

    for (let i = 0; i < voyages.length; i++) {
        const voyage = voyages[i];
        if (currentDate >= voyage.startDate && currentDate <= voyage.endDate) {
            currentVoyage = voyage.number;
            nextVoyage = voyages[i + 1] ? voyages[i + 1].number : null;
            break;
        } else if (currentDate < voyage.startDate) {
            nextVoyage = voyage.number;
            break;
        }
    }
    return { currentVoyage, nextVoyage };
}

/**
 * Retrieves a user's voyage details from Airtable and formats them for a reply message.
 *
 * @param {CommandInteraction} interaction - The interaction object representing the command interaction.
 * @param {string} discordId - The Discord user ID to look up.
 * @param {boolean} [validateDiscordId=true] - Whether to verify that the Discord ID exists before querying Airtable.
 *      Verification is not needed when using context, or when it's invoked by the user using /user
 * @param {boolean} [showUserLocalTime=false] - Whether to include the user's local time (in the timeblock section) in the response.
 * @returns {Promise<string|object>} A promise resolving to the user's voyage details or formatted reply data.
 */

// TODO: remove this whole function
async function getUserVoyageDetails(
    interaction,
    // validateDiscordId=true,
    showUserLocalTime=false,
) {

    try {
        const discordId = interaction.user.id;
        console.log("discordId", discordId)

        const user = await interaction.client.users.fetch(discordId).catch(() => null);
        if(!user) {
            return await interaction.editReply({
                content: `User with Discord ID ${discordId} not found.`,
                ephemeral: true
            });
        }

        const username = user.username;

        // TODO: handle multiple applications for the same person
        // fetch the user's application from airtable
        const applications = await getApplicationsByDiscordId(
            discordId,
            ['Discord Name', 'Evaluation Status (from Solo Project Link)', 'Email']
        );
        console.log("applications", applications.map(app=>app.fields))

        if(applications.length===0) {
            return await interaction.editReply({
                content: `No application found for user with Discord ID ${discordId}.`,
                ephemeral: true
            });
        }


    } catch (e) {
        console.log("[getUserVoyageDetails]: error", e)
    }
}

module.exports = {
    getCurrentAndNextVoyage,
    getUserVoyageDetails,
}