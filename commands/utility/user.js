const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Airtable = require('airtable');
require('dotenv').config();

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about you.'),
    async execute(interaction) {
		try {
            // Fetch the user's application from Airtable
            const applications = await base('Applications').select({
                filterByFormula: `{Discord ID} = '${interaction.user.id}'`,
                fields: ['Discord Name', 'Evaluation Status (from Solo Project Link)', 'Email']
            }).firstPage();

			// Fetch the user's voyage signups from Airtable
			const voyageSignups = await base('Voyage Signups').select({
				filterByFormula: `{Discord ID} = '${interaction.user.id}'`,
                fields: ['Discord Name', 'Email']
			}).firstPage();

            // Check if the user's record exists
            if (applications.length > 0) {
                const application = applications[0];
                const applicationData = application.fields;
            
                let voyageSignupData;
                if (voyageSignups.length > 0) {
                    const voyageSignup = voyageSignups[0];
                    voyageSignupData = voyageSignup.fields;
                }
            
                // Check if the Discord name and email match in both tables
                const isDiscordNameMatch = voyageSignupData && applicationData['Discord Name'] === voyageSignupData['Discord Name'] ? 'Match <a:check:1196112072614887534>' : 'Mismatch :x:';
                const isEmailMatch = voyageSignupData && applicationData['Email'] === voyageSignupData['Email'] ? 'Match <a:check:1196112072614887534>' : 'Mismatch :x:';
				
                let evaluationStatus = applicationData['Evaluation Status (from Solo Project Link)'];
                if (Array.isArray(evaluationStatus)) {
                    if (evaluationStatus.includes('Passed')) {
                        evaluationStatus = 'Passed';
                    } else {
                        evaluationStatus = evaluationStatus[evaluationStatus.length - 1];
                    }
                }
				
				const status = (applicationData['Discord Name'] === interaction.user.username) ? 'OK <a:check:1196112072614887534>' : 'Mismatch :x:';
                const evaluationEmoji = (evaluationStatus && evaluationStatus.toLowerCase() === 'passed') ? '<a:check:1196112072614887534>' : ':x:';

                // Create an embed message
                const embed = new EmbedBuilder()
                    .setColor('#6DE194')
                    .setTitle('User Information')
					.setDescription("A check to see that your Discord account matches with your application, and that you've passed the Solo Project. If any of the fields show an :x:, please open a ticket in <#1194953897408737350> to resolve the issue.")
					.addFields(
						{ name: 'Email', value: applicationData['Email'] ? `${applicationData['Email']} <a:check:1196112072614887534>` : 'No email found :x:' },
						{ name: 'Discord account match', value: status, inline: true },
						{ name: 'Evaluation Status', value: `${evaluationStatus} ${evaluationEmoji}`, inline: true },
						{ name: '\u200B', value: '\u200B' },
					)
					.addFields(
						{ name: 'Voyage Email Match', value: isEmailMatch, inline: true },
						{ name: 'Voyage Discord Match', value: isDiscordNameMatch, inline: true },
					)
					.setThumbnail('https://imgur.com/EII19bn.png');

                // Reply with the user's information in an embed message
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ content: `No additional information found for ${interaction.user.username}.`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while trying to fetch user information.', ephemeral: true });
        }
    },
};