const {
    ContextMenuCommandBuilder, ApplicationCommandType, PermissionsBitField, EmbedBuilder
} = require("discord.js");
const {MemberContext} = require("../../services/MemberContext");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Member Voyage Info')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {
        const discordId = interaction.targetUser.id;

        const memberContext = await MemberContext.create(interaction, discordId)

        await interaction.reply({
            embeds: [memberContext.embedMessage],
            ephemeral: true
        })

    }
}