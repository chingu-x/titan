const { base } = require('./airtable.js');
const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { createFinalYesButton, createFinalNoButton } = require('../handlers/buttons.js');

async function handleCommitmentButton(interaction) {
    try {
        const discordId = interaction.user.id;

        if (interaction.customId === 'commitment_no') {
            await interaction.reply({ content: 'No problem! Come back when you’re ready.', ephemeral: true });
            return;
        }

        if (interaction.customId === 'commitment_yes') {
            
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('Voyage Commitments')
                .setDescription(
                    'By accepting the voyage commitments, you agree to:\n\n' +
                    '1. Actively participate in your team.\n' +
                    '2. Communicate regularly with your team members.\n' +
                    '3. Complete assigned tasks on time.\n' +
                    '4. Follow the community guidelines.\n\n' +
                    'Are you ready to accept these commitments?'
                )
                .setThumbnail('https://imgur.com/EII19bn.png');

            const finalYesButton = createFinalYesButton();
            const finalNoButton = createFinalNoButton();

            const row = new ActionRowBuilder().addComponents(finalYesButton, finalNoButton);

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }

        if (interaction.customId === 'final_commitment_no') {
            await interaction.reply({ content: 'No problem! Come back when you’re ready.', ephemeral: true });
            return;
        }

        if (interaction.customId === 'final_commitment_yes') {
                // Log the Discord ID for debugging
                // console.log(`Updating commitment status for user: ${discordId}`);

                const records = await base('Voyage Signups').select({
                    filterByFormula: `{Discord ID} = '${discordId}'`
                }).firstPage();

                // Log the fetched records for debugging
                // console.log('Fetched records:', records);

                if (records.length > 0) {
                    const record = records[0];
                    console.log(`Updating record ID: ${record.id}`);

                    // Update the confirmation form status in Airtable
                    await base('Voyage Signups').update(record.id, {
                        'Confirmation Form Completed': 'Yes'
                    });

                    await interaction.reply({ content: 'Thank you for accepting the voyage commitments! You are all set for the voyage.', ephemeral: true });
                } else {
                    console.error('No records found for the user in Airtable.');
                    await interaction.reply({ content: 'No voyage signup found. Please sign up for the voyage first.', ephemeral: true });
                }
            }
        } catch (error) {
        console.error('Error updating confirmation form status:', error);
    
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'An error occurred while updating your confirmation status. Please try again later.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'An error occurred while updating your confirmation status. Please try again later.', ephemeral: true });
        }
    }
}

module.exports = { handleCommitmentButton };