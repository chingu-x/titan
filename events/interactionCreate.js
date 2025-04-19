const { Events } = require('discord.js');
const { handleApplicationButton } = require('../handlers/applicationHandler.js');
const { handleCommitmentButton } = require('../handlers/commitmentHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            // Route button interactions based on their customId
            if (interaction.customId === 'chingu_onboarding_button') {
                await handleApplicationButton(interaction);
            } else if (
                interaction.customId === 'commitment_yes' ||
                interaction.customId === 'commitment_no' ||
                interaction.customId === 'final_commitment_yes' ||
                interaction.customId === 'final_commitment_no' ||
                interaction.customId === 'ticket_button'
            ) {
                await handleCommitmentButton(interaction);
            } else {
                console.error(`Unhandled button interaction with customId: ${interaction.customId}`);
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};