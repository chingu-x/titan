const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();
// const openTicketChannel = '1193342042080817323'; // Chingu Open ticket channel ID
// const tempVoiceID = '1194571625337724960'; // Chingu Temp voice text channel ID
const openTicketChannel = process.env.OPEN_TICKET_CHANNEL_ID; // Tester Open ticket channel ID
const tempVoiceID = process.env.TEMP_VOICE_ID; // Tester Temp voice text channel ID
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
                console.log('Bot message already exists in the channel.');
                return;
            }

            fetched.forEach(async message => {
                try {
                    await message.delete();
                } catch (error) {
                    console.error(`Failed to delete message: ${error}`);
                }
            });
        
            // Create the initial button
            const button = new ButtonBuilder()
                .setCustomId('ticket_button')
                .setLabel('📩 Create ticket')
                .setStyle(ButtonStyle.Success);
        
            // Create an action row and add the button to it
            const row = new ActionRowBuilder()
                .addComponents(button);

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