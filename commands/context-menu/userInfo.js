const {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    PermissionsBitField,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    ActionRowBuilder, EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Member Info")
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {
        const userId = interaction.targetUser.id;

        const memberDetailsEmbed = new EmbedBuilder()
            .setColor('#bd67ef')
            .setTitle('View Member Records')
            .setURL(`https://soloproject.chingu.io/admin/member/${userId}`)
            .setDescription(`Open link to view member records. \nMember ID: ${userId}`)

        await interaction.reply({
            embeds: [memberDetailsEmbed],
            ephemeral: true
        })
    }
}