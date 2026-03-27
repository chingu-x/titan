const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const {MemberContext} = require("../../services/MemberContext");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkuser')
        .setDescription('Provides information about a user.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(option =>
            option.setName('discordid')
                .setDescription('The user\'s Discord ID.')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the user has the administrator permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        // Get the Discord ID from the command argument
        const discordId = interaction.options.getString('discordid');

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
    },
};