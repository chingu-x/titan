const { ActionRowBuilder, Events, EmbedBuilder } = require('discord.js');
const { createTicketButton } = require('../handlers/buttons.js');
const { sendOnboardingMessage } = require('../events/application.js');
require('dotenv').config();

const applicationChannelId = process.env.APPLICATION_CHANNEL_ID;
const openTicketChannel = process.env.OPEN_TICKET_CHANNEL_ID; 
const tempVoiceID = process.env.TEMP_VOICE_ID; 
const createMenu = require('./tempVoice.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: async (client) => {
        console.log(`Ready! Logged in as ${client.user.tag}`);
		
		await client.user.setPresence({ 
            activities: [{ 
                name: 'DM for help' }], 
				status: 'online' 
			});

        await sendOnboardingMessage(client, applicationChannelId);
            
        categoryIds = [process.env.CATEGORY_TIER_1_ID, process.env.CATEGORY_TIER_2_ID, process.env.CATEGORY_TIER_3_ID];
        await createMenu(client, categoryIds, tempVoiceID);

        async function sendButtonMessage(client, channelId) {
            // Get the channel
            const channel = client.channels.cache.get(channelId);
        
            // Fetch and delete all messages in the channel
            const fetched = await channel.messages.fetch({ limit: 100 });
            // Check if there is already a message from the bot
            const botMessage = fetched.find(message => message.author.id === client.user.id);
            if (botMessage) {
                console.log('Bot message already exists in the ticket channel.');
                return;
            }

            fetched.forEach(async message => {
                try {
                    await message.delete();
                } catch (error) {
                    console.error(`Failed to delete message: ${error}`);
                }
            });
        
            const ticketButton = createTicketButton();
        
            // Create an action row and add the button to it
            const row = new ActionRowBuilder()
                .addComponents(ticketButton);

            // Create an embed
            const welcomeEmbed = new EmbedBuilder()
                .setTitle('Need any assistance?')
                .setDescription('Welcome to our tickets channel. If you have any questions or inquiries, please click on the `Create ticket` button below to contact the staff!\n\n**After clicking on the button, you will receive a DM from our bot, Titan. When you send a DM to Titan, Titan will send that message to the Admins in a thread that is only visible by Chingu Admins. You will get a response from our Admins via DM in Titan.**')
                .setColor('#6DE194')
				.setThumbnail('https://imgur.com/EII19bn.png');
        
            // Send the button message to the channel with the embed
            await channel.send({ embeds: [welcomeEmbed], components: [row] });
        }

        // Call the function inside the execute function
        await sendButtonMessage(client, openTicketChannel);
    }, 
};