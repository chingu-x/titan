const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Airtable = require('airtable');
require('dotenv').config();

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE);

async function getVoyages() {
    const voyages = await base('Schedules').select({
        view: 'Voyages',
        fields: ['Name', 'Start Date', 'End Date']
    }).firstPage();

    return voyages.map(voyage => ({
        number: voyage.fields['Name'],
        startDate: new Date(voyage.fields['Start Date']),
        endDate: new Date(voyage.fields['End Date'])
    })).filter(voyage => voyage.number !== 'V999').sort((a, b) => a.startDate - b.startDate);
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usercheck')
        .setDescription('Provides information about a user.')
        .addStringOption(option =>
            option.setName('discordid')
                .setDescription('The users Discord ID.')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the command is used in the specific channels
        const allowedChannels = ['1195050183403262053', '1194954848089673728'];
        if (!allowedChannels.includes(interaction.channelId)) {
            return await interaction.reply({ content: 'You can only use this command in specific channels.', ephemeral: true });
        }

        // Get the Discord ID from the command argument
        const discordId = interaction.options.getString('discordid');

        await interaction.deferReply({ ephemeral: true });

        try {
            // Fetch the user object using the Discord ID
            const user = await interaction.client.users.fetch(discordId).catch(() => null);
            if (!user) {
                return await interaction.editReply({ content: `No user found with ID ${discordId}.`, ephemeral: true });
            }
            const username = user.username;

            // Fetch the current and next voyage
            const { currentVoyage, nextVoyage } = await getCurrentAndNextVoyage();

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
                fields: ['Discord Name', 'Email', 'Commitment Form Completed', 'Tier', 'Voyage', 'Team Name', 'Team No.', 'Role']
            }).firstPage();

            let isSignedUpForNextVoyage = false;
            let isSignedUpForCurrentVoyage = false;
            let currentVoyageSignupData = null;
            let nextVoyageSignupData = null;
            
            if (voyageSignups.length > 0) {
                for (const voyageSignup of voyageSignups) {
                    if (voyageSignup.fields['Voyage'] === currentVoyage) {
                        currentVoyageSignupData = voyageSignup.fields;
                        isSignedUpForCurrentVoyage = true;
                    }
                    if (voyageSignup.fields['Voyage'] === nextVoyage || voyageSignup.fields['Voyage'] === "V??") {
                        nextVoyageSignupData = voyageSignup.fields;
                        isSignedUpForNextVoyage = true;
                    }
                }
            }

            // User is signed up for current voyage
            const currentVoyageSignupText = isSignedUpForCurrentVoyage ?
            `User is participating` :
            'User is not participating';

            // Current voyage signup tier and team
            const currentVoyageSignupTierTeam = isSignedUpForCurrentVoyage ?
            `${currentVoyageSignupData['Team Name']}, Team ${currentVoyageSignupData['Team No.']}` :
            'N/A';

            // Current voyage ole
            const currentVoyageSignupRole = isSignedUpForCurrentVoyage ?
            `${currentVoyageSignupData['Role']}` : 'N/A';

            // User is signed up for next voyage
            const nextVoyageSignupText = isSignedUpForNextVoyage ?
                nextVoyageSignupData["Voyage"] === "V??" ? `Pending <a:LoadingEmoji:1274376308327190549> ` :
                `Yes (${nextVoyageSignupData['Tier'].slice(0,6)}) <a:check:1209501960139702363>` :
                'No :x:';

            const commitmentFormText = isSignedUpForNextVoyage ?
                nextVoyageSignupData['Commitment Form Completed'] === 'Yes' ?
                    'Yes <a:check:1209501960139702363>' :
                    'No :x:' :
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
            let discordNameMatch = true;
            let emailMatch = true;

            if (currentVoyageSignupData) {
                if (applicationData['Discord Name'] !== currentVoyageSignupData['Discord Name']) {
                    discordNameMatch = false;
                }
                if (applicationData['Email'] !== currentVoyageSignupData['Email']) {
                    emailMatch = false;
                }
            }

            if (nextVoyageSignupData) {
                if (applicationData['Discord Name'] !== nextVoyageSignupData['Discord Name']) {
                    discordNameMatch = false;
                }
                if (applicationData['Email'] !== nextVoyageSignupData['Email']) {
                    emailMatch = false;
                }
            }

            const isDiscordNameMatch = discordNameMatch ? 'Match <a:check:1209501960139702363>' : (
                currentVoyageSignupData && applicationData['Discord Name'] !== currentVoyageSignupData['Discord Name'] ? 
                `Mismatch :x: (Current Voyage)` : 
                `Mismatch :x: (Next Voyage)`
            );

            const isEmailMatch = emailMatch ? 'Match <a:check:1209501960139702363>' : (
                currentVoyageSignupData && applicationData['Email'] !== currentVoyageSignupData['Email'] ? 
                `Mismatch :x: (Current Voyage)` : 
                `Mismatch :x: (Next Voyage)`
            );

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
                    { name: `Current Voyage is ${currentVoyage}`, value: currentVoyageSignupText, inline: true },
                    { name: `Tier and Team`, value: currentVoyageSignupTierTeam, inline: true },
                    { name: `Role`, value: currentVoyageSignupRole, inline: true },
                    { name: '\u200B', value: '\u200B' },
                )
                .addFields(
                    { name: `Signed up for ${nextVoyage}?`, value: nextVoyageSignupText, inline: true },
                    { name: `Commitment Form for ${nextVoyage}?`, value: commitmentFormText, inline: true }
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