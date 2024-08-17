const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'ticket_button') return;

        // Reply with a hidden message
        await interaction.reply({ content: 'Processing...', ephemeral: true });

        const user = interaction.user;
        const dmChannel = await user.createDM();

        const ticketChannelEmbed = new EmbedBuilder()
            .setColor('#6DE194')
            .setTitle('Are you sure that you want to open a ticket?')
            .setDescription('If you have any issues, questions or concerns, please write it here and we will get back to you shortly.')
            .setThumbnail('https://imgur.com/EII19bn.png');

        await dmChannel.send({ embeds: [ticketChannelEmbed] });

        // Send a follow-up message with the link to the DM
        await interaction.followUp({
            content: `Please open the DM that was sent by <@${interaction.client.user.id}> and type why you're contacting us today. We'll be with you shortly. [Click here to view the DM](https://discord.com/channels/@me/${dmChannel.id})`,
            ephemeral: true
        });

        // Delete the "Processing..." message
        await interaction.deleteReply();
    },
};