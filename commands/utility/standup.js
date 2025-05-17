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

const createResponseEmbed = (user, yesterday, today, blockers) => {
    const name = user.globalName || user.username;
    return new EmbedBuilder()
        .setColor('#6DE194')
        .setTitle(`Daily Standup - ${name}`)
        .addFields(
            { name: 'Yesterday:', value: yesterday },
            { name: 'Today:', value: today },
            { name: 'Blockers:', value: blockers || 'None' },
        )
        .setFooter({
            text: `standup by ${name}`,
            iconURL: user.displayAvatarURL(),
        })
        .setTimestamp();
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('standup')
        .setDescription('Replies with a daily standup form for a team member to fill out'),
    async execute(interaction) {
        try {
            const modal = new ModalBuilder().setCustomId('standupModal').setTitle('Daily Standup');

            ['yesterday', 'today', 'blockers'].forEach((id) => {
                const label = id === 'yesterday' ? 'What did you do Yesterday?' : id === 'today' ? 'What will you do today?' : 'Do you have any blockers?';
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

                const yesterday = modalInteraction.fields.getTextInputValue('yesterdayInput');
                const today = modalInteraction.fields.getTextInputValue('todayInput');
                const blockers = modalInteraction.fields.getTextInputValue('blockersInput') || 'None';

                if (!yesterday || !today) {
                    throw new Error('Please fill out all required fields.');
                }

                const response = createResponseEmbed(modalInteraction.user, yesterday, today, blockers);
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

