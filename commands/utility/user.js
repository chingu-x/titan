const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Airtable = require('airtable');
require('dotenv').config();

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE);

async function getCurrentVoyage() {
    const voyages = await base('Schedules').select({
        view: 'Voyages',
        fields: ['Name', 'Start Date', 'End Date'],
        maxRecords: 3
    }).firstPage();

    const currentDate = new Date();
    let currentVoyage = null;

    // console.log(`Current Date: ${currentDate}`);

    for (let i = 0; i < voyages.length; i++) {
        const voyage = voyages[i];
        const startDate = new Date(voyage.fields['Start Date']);

        if (currentDate >= startDate) {
            if (i > 0) {
                currentVoyage = voyages[i - 1].fields['Name'];
            } else {
                currentVoyage = voyage.fields['Name'];
            }
            // console.log(`Next Voyage determined: ${currentVoyage}`);
            break;
        }
    }

    if (!currentVoyage && voyages.length > 0) {
        // If all voyages are in the future, select the first voyage
        currentVoyage = voyages[0].fields['Name'];
        console.log(`All voyages are in the future. Current Voyage determined: ${currentVoyage}`);
    }

    if (!currentVoyage) {
        console.log('Unable to determine the current voyage.');
    }

    return currentVoyage;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about you.'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        try {
            await interaction.deferReply({ ephemeral: true });
            // Fetch the user object using the Discord ID
            const user = await interaction.client.users.fetch(discordId);
            const username = user.username;

            // Fetch the current voyage
            const currentVoyage = await getCurrentVoyage();

            // Fetch the user's application from Airtable
            const applications = await base('Applications').select({
                filterByFormula: `{Discord ID} = '${discordId}'`,
                fields: ['Discord Name', 'Evaluation Status (from Solo Project Link)', 'Email']
            }).firstPage();

            // If no application data is found, return immediately
            if (applications.length === 0) {
                return await interaction.editReply({ content: `No additional information found for ${username}.`, ephemeral: true });
            }

            const application = applications[0];
            const applicationData = application.fields;

            // Fetch the user's voyage signups from Airtable
            const voyageSignups = await base('Voyage Signups').select({
                filterByFormula: `{Discord ID} = '${discordId}'`,
                fields: ['Discord Name', 'Email', 'Commitment Form Completed', 'Tier', 'Voyage']
            }).firstPage();

            let isSignedUpForCurrentVoyage = false;
            let voyageSignupData = null;
            if (voyageSignups.length > 0) {
                for (const voyageSignup of voyageSignups) {
                    if (voyageSignup.fields['Voyage'] === currentVoyage || voyageSignup.fields['Voyage'] === "V??") {
                        voyageSignupData = voyageSignup.fields;
                        isSignedUpForCurrentVoyage = true;
                        break;
                    }
                }
            }

            // User signup for next voyage
            const nextVoyageSignupText = isSignedUpForCurrentVoyage ?
                voyageSignupData["Voyage"] === "V??" ? `Pending <a:LoadingEmoji:1274376308327190549> ` :
                `Yes (${voyageSignupData['Tier'].slice(0,6)}) <a:check:1209501960139702363>` :
                'No :x: [Click Here to Signup](https://forms.gle/DajSfXQCX4qbMAu8A)';

            const commitmentFormText = isSignedUpForCurrentVoyage ?
                voyageSignupData['Commitment Form Completed'] === 'Yes' ?
                    'Yes <a:check:1209501960139702363>' :
                    'No :x: [Fill out Commitment Form](https://forms.gle/p5bhpoKFVBatQhnCA)' :
                'N/A';

            // Fetch the user's solo project from Airtable
            const soloProjects = await base('Solo Projects').select({
                filterByFormula: `{Discord ID} = '${discordId}'`,
                fields: ['Discord Name', 'Email', 'Tier', 'GitHub ID']
            }).firstPage();

            let soloProjectData = null;
            let soloProjectTier = 'N/A';
            if (soloProjects.length > 0) {
                const soloProject = soloProjects[0];
                soloProjectData = soloProject.fields;
                githubId = soloProjectData['GitHub ID'];
                soloProjectTier = `Tier ${soloProjectData['Tier'][5]}`;
            }

            // Check if the Discord name and email match in both tables
            const isDiscordNameMatch = applicationData && voyageSignupData && applicationData['Discord Name'] === voyageSignupData['Discord Name'] ? 'Match <a:check:1209501960139702363>' : (applicationData && voyageSignupData ? 'Mismatch :x:' : 'N/A');
            const isEmailMatch = applicationData && voyageSignupData && applicationData['Email'] === voyageSignupData['Email'] ? 'Match <a:check:1209501960139702363>' : (applicationData && voyageSignupData ? 'Mismatch :x:' : 'N/A');

            let evaluationStatus = applicationData['Evaluation Status (from Solo Project Link)'];
            if (Array.isArray(evaluationStatus)) {
                if (evaluationStatus.includes('Passed')) {
                    evaluationStatus = 'Passed';
                } else {
                    evaluationStatus = evaluationStatus[evaluationStatus.length - 1];
                }
            }

            let evaluationEmoji = ':x:';
            if (evaluationStatus && evaluationStatus.toLowerCase() === 'passed') {
                evaluationEmoji = '<a:check:1209501960139702363>';
            }

            const status = (applicationData['Discord Name'] === username) ? 'OK <a:check:1209501960139702363>' : 'Mismatch :x:';

            // Create an embed message
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('User Information')
                .setDescription("A check to see that your Discord account matches with your application, and that you've passed the Solo Project. If any of the fields show an :x:, please open a ticket in <#1105911757177888908> to resolve the issue.")
                .addFields(
                    { name: 'Email', value: applicationData && applicationData['Email'] ? `${applicationData['Email']} <a:check:1209501960139702363>` : 'No email found :x:', inline: true },
                    { name: 'Github ID', value: soloProjectData && soloProjectData['GitHub ID'] ? `${soloProjectData['GitHub ID']}` : 'N/A', inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Discord account match', value: status ? status : 'N/A', inline: true },
                    { name: 'Evaluation Status', value: evaluationStatus ? `${evaluationStatus} ${evaluationEmoji}` : 'N/A', inline: true },
                    { name: 'Solo Project Tier', value: soloProjectTier, inline: true },
                    { name: '\u200B', value: '\u200B' },
                )
                .addFields(
                    { name: 'Voyage Email Match', value: isEmailMatch ? isEmailMatch : 'N/A', inline: true },
                    { name: 'Voyage Discord Match', value: isDiscordNameMatch ? isDiscordNameMatch : 'N/A', inline: true },
                    { name: '\u200B', value: '\u200B' },
                )
                .addFields(
                    { name: `Signed up for ${currentVoyage}?`, value: nextVoyageSignupText, inline: true },
                    { name: `Commitment Form for ${currentVoyage}?`, value: commitmentFormText, inline: true }
                )
                .setThumbnail('https://imgur.com/EII19bn.png');

            // Reply with the user's information in an embed message
            await interaction.editReply({
                content: `User Information for <@${discordId}>`,
                embeds: [embed],
                ephemeral: true // Make the message visible only to the user who triggered the command
            });
        } catch (error) {
            console.error('An error occurred while trying to fetch user information:', error.message);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while trying to fetch your information.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'An error occurred while trying to fetch your information.', ephemeral: true });
            }
        }
    },
};