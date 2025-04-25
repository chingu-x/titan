const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { base } = require('./airtable.js');
const { getNextVoyage } = require('../utils/constants.js');
const { 
    createSoloProjectButton,
    createVoyageSignupButton, 
    createCommitmentYesButton, 
    createCommitmentNoButton, 
    createTicketButton, 
    createApplicationButton
 } = require('../handlers/buttons.js');

async function handleApplicationButton(interaction) {
    
    try {
        const discordId = interaction.user.id;

        await interaction.deferReply({ ephemeral: true });
        // Fetch the next voyage number
        const nextVoyage = await getNextVoyage();

        // Fetch user data from Airtable
        const applications = await base('Applications').select({
            filterByFormula: `{Discord ID} = '${discordId}'`,
            fields: ['Discord Name', 'Evaluation Status (from Solo Project Link)', 'Email']
        }).firstPage();

        // Check if the user has an application
        if (applications.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('No Application Found')
                .setDescription(
                    'It seems like you haven’t filled out the **Application** form yet. Please complete the **Application** to proceed.\n*If you think you have already filled the **Application** form, please open a support ticket*'
                );

            const applicationButton = createApplicationButton();
            const ticketButton = createTicketButton();

            const row = new ActionRowBuilder().addComponents(applicationButton, ticketButton);

            await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }

        const soloProjects = await base('Solo Projects').select({
            filterByFormula: `{Discord ID} = '${discordId}'`,
            fields: ['Evaluation Status']
        }).firstPage();

        const voyageSignups = await base('Voyage Signups').select({
            filterByFormula: `{Discord ID} = '${discordId}'`,
            fields: ['Voyage', 'Commitment Form Completed']
        }).firstPage();

        // Check if the user has submitted a solo project
        if (soloProjects.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('Solo Project Submission')
                .setDescription('You’ve completed the **Application** form! Now, submit your solo project to proceed.\n*If you think you have already submitted a **Solo Project**, please open a support ticket*');

            const soloProjectButton = createSoloProjectButton();
            const ticketButton = createTicketButton();

            const row = new ActionRowBuilder().addComponents(soloProjectButton, ticketButton);

            await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }

        // Check the solo project evaluation status
        const soloProject = soloProjects[0];
        const soloProjectStatus = soloProject.fields['Evaluation Status'];

        if (soloProjectStatus === 'Waiting Eval') {
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('Solo Project Under Review')
                .setDescription('Your solo project is under review. Please wait for the evaluators to finish or open a support ticket if you have questions.');

            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (soloProjectStatus === 'Requested Changes') {
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('Requested Changes')
                .setDescription(
                    'Your Solo Project requires changes. Please make the requested changes and resubmit your project.\n\n' +
                    'If you need help, feel free to open a support ticket.'
                );

            const ticketButton = createTicketButton();

            const row = new ActionRowBuilder().addComponents(ticketButton);

            await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }

        if (soloProjectStatus === 'No Response') {
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('No Response')
                .setDescription(
                    'We reached out to you regarding your solo project, but we haven’t received a response for a while.\n\n' +
                    'Please open a support ticket if you need assistance.'
                );

            const ticketButton = createTicketButton();

            const row = new ActionRowBuilder().addComponents(ticketButton);

            await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }

        if (soloProjectStatus !== 'Passed') {
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('Solo Project Not Approved')
                .setDescription(
                    'Your solo project has not been approved yet. Please check your project status or open a support ticket if you have questions.'
                );

            const ticketButton = createTicketButton();

            const row = new ActionRowBuilder().addComponents(ticketButton);

            await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }

        // Check if the user is signed up for the next voyage
        const nextVoyageSignup = voyageSignups.find(signup => signup.fields['Voyage'] === nextVoyage);

        if (!nextVoyageSignup) {
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('Voyage Signup')
                .setDescription('You are not signed up for the next voyage. Please sign up to proceed.\n*If you think you have already signed up for the next **Voyage**, please open a support ticket*');

            const voyageSignupButton = createVoyageSignupButton();
            const ticketButton = createTicketButton();

            const row = new ActionRowBuilder().addComponents(voyageSignupButton, ticketButton);

            await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }

        // Check if the commitment form is already completed
        const commitmentStatus = nextVoyageSignup.fields['Commitment Form Completed'];

        if (commitmentStatus === 'Yes') {
            const embed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('All Steps Completed')
                .setDescription('You’ve completed all the steps! Relax and wait for the voyage to start.');

            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Show the commitment form
        const embed = new EmbedBuilder()
            .setColor('#6DE194')
            .setTitle('Voyage Commitment')
            .setDescription('Are you ready to accept the voyage commitments?');

        const commitmentYesButton = createCommitmentYesButton();
        const commitmentNoButton = createCommitmentNoButton();

        const row = new ActionRowBuilder().addComponents(commitmentYesButton, commitmentNoButton);

        await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
    } catch (error) {
        console.error(`Error handling application button (userId: ${interaction.user.id}):`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
        }
    }
}

module.exports = { handleApplicationButton };