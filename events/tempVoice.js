const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Define the createMenu function
async function createMenu(client, categoryIds, channelId) {
    // Get the first guild the bot is connected to
    const guild = client.guilds.cache.first();

    // Create an array to hold the action rows
    let rows = [];

    // Define the titles for each category
    const titles = ['Voyage Teams Tier 1', 'Voyage Teams Tier 2', 'Voyage Teams Tier 3'];

    // Iterate over each category ID
    for (let i = 0; i < categoryIds.length; i++) {
        let categoryId = categoryIds[i];

        // Get the category from the guild
        const category = guild.channels.cache.get(categoryId);

        // If the category is not found or it's not a category, log an error and continue with the next ID
        if (!category || category.type !== 4) {
            console.log(`Category with ID ${categoryId} not found or not a category`);
            continue;
        }

        // Get all text and forum channels in the category
        const textChannels = guild.channels.cache
        .filter(channel => (channel.type === 0 || channel.type === 15) && channel.parentId === categoryId)
        .sort((a, b) => {
            // Extract the last two digits from the channel names
            const numA = parseInt(a.name.slice(-2), 10);
            const numB = parseInt(b.name.slice(-2), 10);

            // Compare the numbers
            return numA - numB;
        });
        
        // Map each text channel to an option for the select menu
        const options = textChannels.map(channel => ({
            label: channel.name,
            description: `This is ${channel.name}`,
            value: channel.id,
        }));

        // Create a new action row with a select menu
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`menu-${categoryId}`)
                    .setPlaceholder('Select a channel...')
                    .addOptions(options),
            );

        // Add the action row to the rows array with the corresponding title
        rows.push({ content: titles[i], components: [row] });
    }

    // Get the channel where the menu will be sent
    const channel = guild.channels.cache.get(channelId);
    // If the channel is not found or it's not a text channel, log an error and return
    if (!channel || channel.type !== 0) {
        console.log(`Channel with ID ${channelId} not found or not a text channel`);
        return;
    }

    // Send each row to the channel
    for (let row of rows) {
        channel.send(row);
    }

    // Listen for interactions
    client.on('interactionCreate', async (interaction) => {
        // If the interaction is not a message component or the custom ID doesn't start with 'menu', return
        if (!interaction.isMessageComponent() || !interaction.customId.startsWith('menu')) return;

        // Defer the reply to the interaction
        await interaction.deferReply({ ephemeral: true });

        // Get the ID of the selected text channel
        const textChannelId = interaction.values[0];
        // Get the text channel from the guild
        const textChannel = interaction.guild.channels.cache.get(textChannelId);

        // If the text channel is not found or it's not a text channel, log an error and return
        // If the text channel is not found or it's not a text channel or a thread channel, log an error and return
        if (!textChannel || (textChannel.type !== 0 && textChannel.type !== 15)) {
            console.log(`Channel with ID ${textChannelId} not found or not a text or thread channel`);
            return;
        }

        // Try to find an existing voice channel with the same name in the category
        const existingVoiceChannel = interaction.guild.channels.cache.find(channel => 
            channel.type === 2 && 
            channel.parentId === textChannel.parentId && 
            channel.name.trim().toLowerCase() === textChannel.name.trim().toLowerCase()
        );

        // If an existing voice channel is found, send a message to the user and return
        if (existingVoiceChannel) {
            await interaction.editReply({ content: `A voice channel for ${textChannel.name} already exists.`});
            await interaction.followUp({ content: `Here is the link to the voice channel: discord://discordapp.com/channels/${interaction.guild.id}/${existingVoiceChannel.id}`, ephemeral: true });
            
            const categoryId = interaction.customId.split('-')[1];
            const row = rows.find(row => row.components[0].customId === `menu-${categoryId}`);
            await interaction.message.edit(row);
            
            return;
        }

        // Try to create the new voice channel
        try {
            const voiceChannel = await interaction.guild.channels.create({
                name: textChannel.name,
                type: 2,
                parent: textChannel.parent,
                permissionOverwrites: textChannel.permissionOverwrites.cache.map(overwrite => ({
                    id: overwrite.id,
                    allow: overwrite.allow,
                    deny: overwrite.deny,
                    type: overwrite.type,
                })),
            });
            console.log(`Created voice channel with ID ${voiceChannel.id}`);

            // Reply to the interaction
            await interaction.editReply({ content: `Created your voice channel: ${voiceChannel.name}`, ephemeral: true });

            // Send a follow-up message with the link to the voice channel
            await interaction.followUp({ content: `Here is the link to the voice channel: discord://discordapp.com/channels/${interaction.guild.id}/${voiceChannel.id}`, ephemeral: true });

            // Set a timer to check the voice channel's members every minute
            const checkInterval = setInterval(async () => {
                // If the voice channel has no members, delete it
                if (voiceChannel.members.size === 0) {
                    clearInterval(checkInterval);
                    await voiceChannel.delete();
                    console.log(`Deleted voice channel with ID ${voiceChannel.id}`);
                }
            }, 60000); // 60000 milliseconds = 1 minute

            // Update the message with the select menu
            const categoryId = interaction.customId.split('-')[1];
            const row = rows.find(row => row.components[0].customId === `menu-${categoryId}`);
            await interaction.message.edit(row);
        } catch (error) {
            console.error(`Failed to create voice channel: ${error}`);
        }
    });
}

module.exports = createMenu;


