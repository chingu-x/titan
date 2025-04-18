const { ButtonBuilder, ButtonStyle } = require('discord.js');

function createApplicationButton() {
    return new ButtonBuilder()
    .setLabel('Application Form')
    .setStyle(ButtonStyle.Link)
    .setURL('https://discordoauthserver-production.up.railway.app/auth/discord')
}

function createSoloProjectButton() {
    return new ButtonBuilder()
    .setLabel('Solo Project Form')
    .setStyle(ButtonStyle.Link)
    .setURL('https://forms.gle/your-solo-project-form-link');
}

function createVoyageSignupButton() {
    return new ButtonBuilder()
    .setLabel('Voyage Signup Form')
    .setStyle(ButtonStyle.Link)
    .setURL('https://forms.gle/your-voyage-signup-form-link');
}

function createCommitmentYesButton() {
    return new ButtonBuilder()
    .setCustomId('commitment_yes')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success);
}

function createCommitmentNoButton() {
    return new ButtonBuilder()
    .setCustomId('commitment_no')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger);
}

function createTicketButton() {
    return new ButtonBuilder()
    .setCustomId('ticket_button')
    .setLabel('📩 Open Support Ticket')
    .setStyle(ButtonStyle.Primary);
}

function createYesButton() {
    return new ButtonBuilder()
    .setCustomId('yes_button')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success);
}

function createNoButton() {
    return new ButtonBuilder()
    .setCustomId('no_button')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger);
}

function createFinalYesButton() {
    return new ButtonBuilder()
    .setCustomId('final_commitment_yes')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success);
}

function createFinalNoButton() {
    return new ButtonBuilder()
    .setCustomId('final_commitment_no')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger);
}

module.exports = { 
    createTicketButton,
    createApplicationButton,
    createSoloProjectButton,
    createVoyageSignupButton,
    createCommitmentYesButton,
    createCommitmentNoButton,
    createYesButton,
    createNoButton,
    createFinalYesButton,
    createFinalNoButton
};