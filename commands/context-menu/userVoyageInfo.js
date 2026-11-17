import {
    ContextMenuCommandBuilder, ApplicationCommandType, PermissionsBitField, EmbedBuilder
} from 'discord.js';
import { MemberContext } from '../../services/MemberContext.js';

export default {
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
