const { Events, EmbedBuilder} = require('discord.js');
const { handleApplicationButton } = require('../handlers/applicationHandler.js');
const { handleCommitmentButton } = require('../handlers/commitmentHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isContextMenuCommand()) {
                const contextMenuCommands = ['Send DM', 'Member Info'];
                if (contextMenuCommands.includes(interaction.commandName)) {
                    const command = interaction.client.commands.get(interaction.commandName);
                    if(!command) return;
                    await command.execute(interaction);
                }
                return;
            }
            if (interaction.isModalSubmit()) {
                // send user DM through user context menu
                if (interaction.customId.startsWith('sendDMModal')) {
                    try {
                        const userId = interaction.customId.split(':')[1];
                        const message = interaction.fields.getTextInputValue('dmMessage');

                        const user = interaction.client.users.cache.get(userId);

                        const embed = new EmbedBuilder()
                            .setColor('#6DE194')
                            .setDescription(message)
                            .setFooter({ text: '- Titan from Chingu' })

                        await user.send({embeds: [embed]});

                        await  interaction.reply({ content: `DM sent to ${user.tag}`, ephemeral: true });
                    } catch (error) {
                        await interaction.reply({ content: `Failed to send DM. ${error}`, ephemeral: true });
                    }
                }
                return
            }
            if (interaction.isButton()) {
                if (interaction.customId === 'chingu_onboarding_button') {
                    await handleApplicationButton(interaction);
                } else if (
                    interaction.customId === 'commitment_yes' ||
                    interaction.customId === 'commitment_no' ||
                    interaction.customId === 'final_commitment_yes' ||
                    interaction.customId === 'final_commitment_no' ||
                    interaction.customId === 'ticket_button'
                ) {
                    await handleCommitmentButton(interaction);
                } else {
                    console.error(`Unhandled button interaction with customId: ${interaction.customId}`);
                }
                return;
            }
    
            if (!interaction.isChatInputCommand()) return;
    
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            await command.execute(interaction);

        } catch (error) {
            console.error(`Error handling interaction (type: ${interaction.type}, id: ${interaction.id}):`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};