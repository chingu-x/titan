const { ButtonBuilder, ButtonStyle } = require('discord.js');

function createTicketButton() {
    return new ButtonBuilder()
    .setCustomId('ticket_button')
    .setLabel('📩 Create ticket')
    .setStyle(ButtonStyle.Success);
}

module.exports = { createTicketButton };