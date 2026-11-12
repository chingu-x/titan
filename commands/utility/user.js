const { SlashCommandBuilder } = require('discord.js');
const {MemberContext} = require('../../services/MemberContext.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about you.'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        try {
            const memberContext = await MemberContext.create(interaction, discordId)

<<<<<<< HEAD
            await interaction.reply({
                embeds: [memberContext.embedMessage],
                ephemeral: true
            })
=======
            const commitmentFormText = isSignedUpForNextVoyage ?
                nextVoyageSignupData['Commitment Form Completed'] === 'Yes' ?
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
                .setDescription("A check to see that your Discord account matches with your application, and that you've passed the Solo Project. If any of the fields show an :x:, please open a ticket in <#1193342042080817323> to resolve the issue.")
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
>>>>>>> 93f12795b2938a513ed21438446f07dab60e55ba
        } catch (error) {
            console.error('An error occurred while trying to fetch user information:', error.message);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while trying to fetch your information.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'An error occurred while trying to fetch your information.', ephemeral: true });
            }
        }
    }
};