const { ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'buttonCreate',
    async execute(channel, buttonLabel, buttonUrl) {
        // Create a new button
        let button = new ButtonBuilder()
            .setStyle('Link') // Button style: LINK
            .setLabel(buttonLabel) // Button label
            .setURL(buttonUrl); // URL for the button

        // Create a new action row and add the button to it
        let actionRow = new ActionRowBuilder()
            .addComponents(button);

        // Send the action row to the channel
        await channel.send({ content: 'Click the button below to go to our Application Form', components: [actionRow] });
    },
};