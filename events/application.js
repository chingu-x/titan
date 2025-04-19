const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { createChinguOnboardingButton } = require('../handlers/buttons.js');

async function sendOnboardingMessage(client, channelId) {
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.error(`Channel with ID "${channelId}" not found.`);
        return;
    }

    try {
        // Fetch and delete old messages from the bot
        const fetchedMessages = await channel.messages.fetch({ limit: 100 });
        const botMessage = fetchedMessages.find(message => message.author.id === client.user.id);

        if (botMessage) {
            console.log('Onboarding message already exists in the channel.');
            return;
        }

        // Create the embed and button
        const embed = new EmbedBuilder()
            .setColor('#6DE194')
            .setTitle('Application Process')
            .setDescription(
                'Welcome to the Chingu Onboarding process! Click the button below to start or check your current status.\n\n' +
                '**Steps:**\n' +
                '1. Fill out the application form.\n' +
                '2. Submit your solo project.\n' +
                '3. Sign up for the next voyage.\n' +
                '4. Complete the commitment form.'
            )
            .setThumbnail('https://imgur.com/EII19bn.png');

        const chinguOnboardingButton = createChinguOnboardingButton();
        const row = new ActionRowBuilder().addComponents(chinguOnboardingButton);

        // Send the message
        await channel.send({ embeds: [embed], components: [row] });
        console.log('Onboarding message sent successfully.');
    } catch (error) {
        console.error('Failed to send onboarding message:', error);
    }
}

module.exports = { sendOnboardingMessage };