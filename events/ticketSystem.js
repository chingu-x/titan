const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const serverId = process.env.GUILD_ID;
const channelId = process.env.PROCESS_TICKET_CHANNEL_ID;
const MAX_MESSAGE_LENGTH = 1900;

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) => {
        // If the message is from the bot itself, ignore it
        if (message.author.bot) {
            return;
        }
        if (message.channel.type === 1) {

            const server = message.client.guilds.cache.get(serverId);
            const channel = server.channels.cache.get(channelId);

            if (!channel) {
                console.error(`Channel with ID "${channelId}" not found.`);
                return;
            }

            try {
                const threadName = `Ticket from ${message.author.tag}, ID ${message.author.id}`;

                // Fetch active threads in the channel
                const fetchThreadsResult = await channel.threads.fetchActive();

                // Check if there's an existing thread from the same user
                let thread = fetchThreadsResult.threads.find(t => t.name.includes(message.author.id));

                // If there's no existing thread, create a new one
                if (!thread) {
                    // Send a message to the channel before creating the thread

                    const newTicketMessage = await channel.send(`New ticket from <@${message.author.id}>`);

                    thread = await newTicketMessage.startThread({
                        name: threadName,
                    });



                  const newTicketEmbed = new EmbedBuilder()
                  .setColor('#6DE194')
                  .setTitle('New Ticket')
                  .setDescription('A new ticket has been opened for your request. We will get back to you shortly.')
                  .setThumbnail('https://imgur.com/EII19bn.png');

                    // Send the embed message back to the user
                await message.reply({ embeds: [newTicketEmbed] });

                const memberDetailsEmbed = new EmbedBuilder()
                    .setColor('#bd67ef')
                    .setTitle('View Member Records')
                    .setURL(`https://soloproject.chingu.io/admin/member/${message.author.id}`)
                    .setDescription(`Open link to view member records. \nMember ID: ${message.author.id}`)

                await thread.send({embeds:[memberDetailsEmbed]})
                }

                const messageChunks = [];
                let remainingMessage = message.content;

                while (remainingMessage.length > 0) {
                    if (remainingMessage.length <= MAX_MESSAGE_LENGTH) {
                        messageChunks.push(remainingMessage)
                        break;
                    }

                    const chunk = remainingMessage.slice(0, MAX_MESSAGE_LENGTH);
                    let splitIndex = -1

                    const lastNewlineIndex = chunk.lastIndexOf('\n');
                    const lastFullstopIndex = chunk.lastIndexOf('.');
                    const lastCommaIndex = chunk.lastIndexOf(',');

                    const foundDelimiter = lastNewlineIndex > 0 || lastFullstopIndex > 0 || lastCommaIndex > 0;

                    if(foundDelimiter) {
                        splitIndex = Math.max(lastNewlineIndex, lastFullstopIndex, lastCommaIndex) + 1;
                    } else {
                        splitIndex = MAX_MESSAGE_LENGTH;
                    }

                    messageChunks.push(remainingMessage.substring(0, splitIndex).trim());
                    remainingMessage = remainingMessage.substring(splitIndex).trim();
                }

                await thread.send(`__<@${message.author.id}> **says:**__\n`);
                // Send the direct message to the thread
                for (const chunk of messageChunks) {
                    await thread.send(`${chunk}\n`);
                }


                // Send the attachments back to the thread
                message.attachments.each(async (attachment) => {
                    await thread.send({
                        files: [{
                            attachment: attachment.url,
                            name: attachment.name
                        }]
                    });
                });

            } catch (error) {
                console.error(`Failed to send message to thread: ${error}`);
            }
        }
        // If the message is in a thread in the specific channel
        if (message.channel.isThread() && message.channel.parentId === channelId) {

            // Extract the user ID from the thread name
            const userId = message.channel.name.split(' ').pop();

            // Fetch the user
            const user = await message.client.users.fetch(userId);

            // Check if the message starts with .reply
            if (message.content.startsWith('.reply ')) {
                // Remove the .reply from the message
                const replyMessage = message.content.slice('.reply'.length).trim();

                // Send the message to the user who sent the message in the thread
                user.send(`**Message from ${message.author} regarding your ticket:**\n\n${replyMessage}\n`)
                    .then(() => {
                        // React to the message with an email emoji
                        message.react('📧');
                    })
                    .catch(error => console.error(`Failed to send message to user: ${error}`));

                // send attachments to the member
                message.attachments.each(async (attachment) => {
                    await user.send({
                        files: [{
                            attachment: attachment.url,
                            name: attachment.name
                        }]
                    });
                });
            }

            // Check if the message is .close
            else if (message.content.trim() === '.close') {
                // Create an embed for the .close notification
                const closeEmbed = new EmbedBuilder()
                    .setColor('#6DE194')
                    .setTitle('Ticket Closed')
                    .setDescription('Your ticket has been closed, we hope that it was resolved to your satisfaction. If you write more to Titan, a new ticket will be created. Have a nice day!')
                    .setThumbnail('https://imgur.com/EII19bn.png');

                // Send the embed to the user
                user.send({ embeds: [closeEmbed] })
                    .then(() => {
                        // Rename the thread and then close it
                        message.channel.setName(`Closed - ${message.channel.name}`)
                            .then(updatedThread => updatedThread.setArchived(true, 'Thread closed by bot'))
                            .catch(error => console.error(`Failed to rename and close thread: ${error}`));
                    })
                    .catch(error => console.error(`Failed to send notification to user: ${error}`));
            }
        }
    }
};


