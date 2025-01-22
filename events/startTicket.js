const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'ticket_button') return;

        try {
            // Reply with a hidden message
            await interaction.reply({ content: 'Processing...', ephemeral: true });

            const user = interaction.user;
            let dmChannel;

            try {
                dmChannel = await user.createDM();
            } catch (dmError) {
                console.error('Failed to create DM channel:', dmError);
                await interaction.followUp({
                    content: `I couldn't send you a DM, <@${user.id}>. Please check your privacy settings and try again. If you have issues setting your privacy settings, you can directly DM an admin to ask for help.`,
                    ephemeral: true
                });
                return;
            }

            const ticketChannelEmbed = new EmbedBuilder()
                .setColor('#6DE194')
                .setTitle('Chingu Support Ticket')
                .setDescription("Please tell us why you have contacted us today, an Admin will be with you as soon as you have posted your message and we've read it. If you accidentally clicked the button, just ignore this.")
                .setThumbnail('https://imgur.com/EII19bn.png');

            try {
                await dmChannel.send({ embeds: [ticketChannelEmbed] });

                // Send a follow-up message with the link to the DM
                await interaction.followUp({
                    content: `Please open the DM that was sent by <@${interaction.client.user.id}> and tell us why you're contacting us today. We'll be with you shortly. [Click here to view the DM](https://discord.com/channels/@me/${dmChannel.id})`,
                    ephemeral: true
                });

                // Delete the "Processing..." message
                await interaction.deleteReply();
            } catch (sendError) {
                if (sendError.code === 50007) {
                    console.error('Cannot send messages to this user:', sendError);
                    await interaction.followUp({
                        content: `I couldn't send you a DM, <@${user.id}>. Please check your privacy settings and try again.`,
                        ephemeral: true
                    });
                } else {
                    console.error('Failed to send DM:', sendError);
                    await interaction.followUp({
                        content: 'An error occurred while processing your request. Please try again later.',
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('An error occurred while processing the ticket:', error);
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
                }
            } catch (replyError) {
                console.error('Failed to send error message to user:', replyError);
            }
        }
    },
};