const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('Send a message to all channels in a category.')
        .addStringOption(option => option.setName('category').setDescription('The ID of the category.').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The message to send.').setRequired(true)),
    async execute(interaction) {
        try {
            // Check if the sender has the 'ADMINISTRATOR' permission
            if (interaction.member.permissions.has('ADMINISTRATOR')) {
                // Extract the category ID and message from the options
                const categoryId = interaction.options.getString('category');
                const message = interaction.options.getString('message');

                // Create an embed with the message
                const embed = new EmbedBuilder()
                    .setColor('#6DE194')
                    .setTitle('Chingu Admin Broadcast')
                    .setThumbnail('https://imgur.com/EII19bn.png')
                    .setFooter({ text: `Message sent by ${interaction.user.displayName}`, iconURL: 'https://imgur.com/EII19bn.png' })
                    .setDescription(message);

                // Get the category from the guild
                const category = interaction.guild.channels.cache.get(categoryId);

                // Check if the category exists and is a 'category' type channel
                if (category && category.type === 4) {
                    // Get all channels in the category
                    const channels = interaction.guild.channels.cache.filter(channel => channel.parentId === category.id);

                    // Send the embed to all channels in the category
                    channels.each(channel => {
                        if (channel.type === 0) {
                            channel.send({ embeds: [embed] });
                        }
                    });

                    await interaction.reply('Message broadcasted successfully.');
                } else {
                    await interaction.reply('Invalid category ID.');
                }
            } else {
                await interaction.reply('You do not have permission to use this command.');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while trying to broadcast the message.');
        }
    },
};