import { ButtonBuilder, ButtonStyle } from 'discord.js';

export function createApplicationButton() {
    return new ButtonBuilder()
    .setLabel('Application Form')
    .setStyle(ButtonStyle.Link)
    .setURL('https://discordoauthserver-production.up.railway.app/auth/discord')
}

export function createChinguOnboardingButton() {
    return new ButtonBuilder()
    .setCustomId('chingu_onboarding_button')
    .setLabel('📝 Chingu Onboarding')
    .setStyle(ButtonStyle.Primary);
}

export function createSoloProjectButton() {
    return new ButtonBuilder()
    .setLabel('Solo Project Form')
    .setStyle(ButtonStyle.Link)
    .setURL(process.env.SOLO_PROJECT_FORM_URL);
}

export function createVoyageSignupButton() {
    return new ButtonBuilder()
    .setLabel('Voyage Signup Form')
    .setStyle(ButtonStyle.Link)
    .setURL(process.env.VOYAGE_SIGNUP_FORM);
}

export function createCommitmentYesButton() {
    return new ButtonBuilder()
    .setCustomId('commitment_yes')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success);
}

export function createCommitmentNoButton() {
    return new ButtonBuilder()
    .setCustomId('commitment_no')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger);
}

export function createTicketButton() {
    return new ButtonBuilder()
    .setCustomId('ticket_button')
    .setLabel('📩 Open Support Ticket')
    .setStyle(ButtonStyle.Primary);
}

export function createYesButton() {
    return new ButtonBuilder()
    .setCustomId('yes_button')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success);
}

export function createNoButton() {
    return new ButtonBuilder()
    .setCustomId('no_button')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger);
}

export function createFinalYesButton() {
    return new ButtonBuilder()
    .setCustomId('final_commitment_yes')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success);
}

export function createFinalNoButton() {
    return new ButtonBuilder()
    .setCustomId('final_commitment_no')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger);
}
