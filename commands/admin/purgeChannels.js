const { SlashCommandBuilder, Collection } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgechannels')
        .setDescription('Purge all channels in a category.')
        .addStringOption(option => option.setName('category').setDescription('The ID of the category to purge.')),
    async execute(interaction) {
        try {
            // Check if the sender has the 'ADMINISTRATOR' permission
            if (interaction.member.permissions.has('ADMINISTRATOR')) {

                // Extract the category ID from the options
                const categoryId = interaction.options.getString('category');

                // Get the category from the guild
                const category = interaction.guild.channels.cache.get(categoryId);

                // Check if the category exists and is a 'category' type channel
                if (category && category.type === 4) {
                    // Get all channels in the category
                    const channels = category.children.cache;

                    // Check if channels is defined and is a Collection
                    if (channels && channels instanceof Collection) {
                        
                        // Delete all channels in the category
                        channels.forEach(channel => channel.delete());
                        await interaction.reply('Category purged successfully.');
                    } else {
                        await interaction.reply('No channels to purge in this category.');
                    }
                } else {
                    await interaction.reply('Invalid category ID.');
                }
            } else {
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while trying to purge the channels.');
        }
    },
    permissions: [
        {
            id: process.env.ADMIN_ROLE_ID,
            type: 'ROLE',
            permission: true,
        },
    ],
};