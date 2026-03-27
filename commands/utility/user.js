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

            await interaction.reply({
                embeds: [memberContext.embedMessage],
                ephemeral: true
            })
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