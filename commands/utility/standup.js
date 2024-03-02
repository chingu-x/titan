const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    SlashCommandBuilder,
} = require('discord.js');

const createTextInput = (id, label, placeholder) =>
    new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setPlaceholder(placeholder)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

const handleError = (console, error) => {
    console.error('An error occurred:', error);
};

const createResponseEmbed = (interaction, yesterday, today, blockers) => {
    const name = interaction.user.globalName || interaction.user.username;
    return new EmbedBuilder()
        .setColor('#6DE194')
        .setTitle('Daily Standup')
        .addFields(
            { name: 'Yesterday:', value: yesterday },
            { name: 'Today:', value: today },
            blockers ? { name: 'Blockers:', value: blockers } : null, // Only add blockers field if it has a value
        )
        .setFooter({
            text: `standup by ${name}`,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('standup')
        .setDescription('Replies with a daily standup form for a team member to fill out'),
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('standupModal').setTitle('Daily Standup');

        ['yesterday', 'today', 'blockers'].forEach((id) => {
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    createTextInput(`${id}Input`, `What did you do ${id}?`, `e.g. Had a sprint planning meeting`),
                ),
            );
        });

        await interaction.showModal(modal);

        const filter = (interaction) => interaction.customId === 'standupModal';

        try {
            const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 10000 }); // Timeout value

            const yesterday = modalInteraction.fields.getTextInputValue('yesterdayInput');
            const today = modalInteraction.fields.getTextInputValue('todayInput');
            const blockers = modalInteraction.fields.getTextInputValue('blockersInput');

            if (!yesterday || !today) {
                throw new Error('Please fill out all required fields (Yesterday and Today).');
            }

            const response = createResponseEmbed(interaction, yesterday, today, blockers);
            await modalInteraction.reply({ embeds: [response] }); // Use "modalInteraction" here to reply to the correct interaction
        } catch (error) {
            if (error.code === 'InteractionCollectorError') {
                console.error('Interaction timed out.');
                // Optionally, inform the user about the timeout and suggest retrying
            } else {
                handleError(console, error);
            }
        }
    },
};



