const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('countmessages')
        .setDescription('Count the number of messages in each channel in a category.')
        .addStringOption(option => option.setName('category').setDescription('The ID of the category.').setRequired(true)),
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
                    const channels = interaction.guild.channels.cache.filter(channel => channel.parentId === category.id);

                    // Count the number of messages in each channel
                    let messageCounts = '';
                    for (const channel of channels.values()) {
                        if (channel.type === 0) {
                            const messages = await channel.messages.fetch();
                            messageCounts += `${channel.name}: ${messages.size}\n`;
                        }
                    }

                    await interaction.reply(messageCounts || 'No messages found.');
                } else {
                    await interaction.reply('Invalid category ID.');
                }
            } else {
                await interaction.reply('You do not have permission to use this command.');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while trying to count the messages.');
        }
    },
};