const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const createTextInput = (id, label, placeholder) =>
    new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setPlaceholder(placeholder)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

const handleError = async (interaction, error) => {
    console.error('An error occurred:', error);
    const errorMessage = error.message || 'An unexpected error occurred. Please try again later.';
    if (interaction.deferred || interaction.replied) {
        try {
            await interaction.editReply({ content: errorMessage, ephemeral: true });
        } catch (editError) {
            console.error('Failed to edit reply:', editError);
        }
    } else {
        try {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        } catch (replyError) {
            console.error('Failed to send reply:', replyError);
        }
    }
};

const createResponseEmbed = (user, background, codingHistory, careerGoals, chinguGoals, strengths, projects) => {
    const name = user.globalName || user.username;
    return new EmbedBuilder()
        .setColor('#6DE194')
        .setTitle(`My Introduction - ${name}`)
        .addFields(
            { name: 'Background:', value: background },
            { name: 'Coding History:', value: codingHistory },
            { name: 'Career Goals:', value: careerGoals },
            { name: 'Chingu Goals:', value: chinguGoals },
            { name: 'Strengths:', value: strengths },
            { name: 'Projects:', value: projects },
        )
        .setFooter({
            text: `introduction by ${name}`,
            iconURL: user.displayAvatarURL(),
        })
        .setTimestamp();
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('intro')
        .setDescription('Replies with a introduction form for a team member to fill out'),
    async execute(interaction) {
        try {
            const modal = new ModalBuilder().setCustomId('standupModal').setTitle('Introduction');

            ['background', 'codingHistory', 'careerGoals', 'chinguGoals', 'strengths', 'projects'].forEach((id) => {
                let label
                switch (id) {
                    case 'background': 
                        label = 'What would you like to share about yourself?';
                        break;
                    case 'codingHistory':
                        label = 'What is your coding history?';
                        break;
                    case 'careerGoals':
                        label = 'What are your career goals?';
                        break;
                    case 'chinguGoals':
                        label = 'What are your goals with Chingu?';
                        break;
                    case 'strengths':
                        label = 'What are your strengths?';
                        break;
                    case 'projects':
                        label = 'What projects are you working on?';
                        break;
                    default:
                        label = 'Please provide your input';
                }
                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        createTextInput(`${id}Input`, label, ` `),
                    ),
                );
            });

            await interaction.showModal(modal);

            const filter = (modalInteraction) => modalInteraction.customId === 'standupModal' && modalInteraction.user.id === interaction.user.id;

            try {
                const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 870000 }); // 14.5 minutes

                const background = modalInteraction.fields.getTextInputValue('backgroundInput');
                const codingHistory = modalInteraction.fields.getTextInputValue('codingHistoryInput');
                const careerGoals = modalInteraction.fields.getTextInputValue('careerGoalsInput');
                const chinguGoals = modalInteraction.fields.getTextInputValue('chinguGoalsInput');
                const strengths = modalInteraction.fields.getTextInputValue('strengthsInput');
                const projects = modalInteraction.fields.getTextInputValue('projectsInput');
                if (!background || !codingHistory || !careerGoals || !chinguGoals || !strengths || !projects) {
                    throw new Error('Please fill out all required fields.');
                }

                const response = createResponseEmbed(modalInteraction.user, background, codingHistory, chinguGoals, strengths, projects);
                await modalInteraction.reply({ embeds: [response] });
            } catch (error) {
                if (error.code === 'InteractionCollectorError') {
                    console.error('Standup interaction timed out.');
                  
                } else {
                    await handleError(interaction, error, 'An error occurred while processing your standup submission. Please try again.');
                }
            }
        } catch (error) {
            await handleError(interaction, error, 'An error occurred while initiating the standup form. Please try again.');
        }
    },
};

