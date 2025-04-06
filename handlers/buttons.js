const { ButtonBuilder, ButtonStyle } = require('discord.js');

function createApplicationButton() {
    return new ButtonBuilder()
    .setCustomId('application_button')
    .setLabel('📝 Application')
    .setStyle(ButtonStyle.Primary);
}

function createSoloProjectButton() {
    return new ButtonBuilder()
    .setCustomId('solo_project_button')
    .setLabel('💻 Submit Solo Project')
    .setStyle(ButtonStyle.Primary);
}

function createVoyageSignupButton() {
    return new ButtonBuilder()
    .setCustomId('voyage_signup_button')
    .setLabel('🚀 Voyage Signup')
    .setStyle(ButtonStyle.Primary);
}

function createCommitmentButton() {
    return new ButtonBuilder()
    .setCustomId('commitment_button')
    .setLabel('📝 Commitment')
    .setStyle(ButtonStyle.Primary);
}

function createTicketButton() {
    return new ButtonBuilder()
    .setCustomId('ticket_button')
    .setLabel('📩 Create ticket')
    .setStyle(ButtonStyle.Success);
}

module.exports = { 
    createTicketButton,
    createApplicationButton,
    createSoloProjectButton,
    createVoyageSignupButton,
    createCommitmentButton,
};