const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    PermissionsBitField,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    ActionRowBuilder
} = require("discord.js");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Send DM")
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {
        const user = interaction.targetUser;

        const modal = new ModalBuilder()
            .setCustomId(`sendDMModal:${user.id}`)
            .setTitle(`Send DM to ${user.username}`);

        const messageInput = new TextInputBuilder()
            .setCustomId(`dmMessage`)
            .setLabel('Message')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('Enter your message here...The message must be sent within 10 minutes and less than 2000 characters.');

        const row = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
}