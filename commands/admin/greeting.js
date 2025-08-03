const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const defaultGreeting =
    `🌞 Good morning, afternoon, or evening Chingus :chinguemoji:\n` +
    `🌞 Buenos días tarde o noche Chingus :chinguemoji:\n` +
    `🌞 God morgen, dag eller aften/kveld/kväll Chingus :chinguemoji:\n` +
    `🌞 Bonjour, après-midi ou soir Chingus :chinguemoji:\n` +
    `🌞 Guten Morgen, Nachmittag oder Abend Chingus :chinguemoji:\n` +
    `🌞 सुप्रभात, दोपहर या शाम Chingus :chinguemoji:\n` +
    `🌞 শুভ সকাল, দুপুর অথবা সন্ধ্যা Chingus :chinguemoji:\n` +
    `🌞 早上好、下午好或晚上好 Chingus :chinguemoji:\n` +
    `🌞 Bom dia, tarde ou noite Chingus :chinguemoji:\n` +
    `🌞 좋은 아침, 좋은 오후 아니면 좋은 저녁 :chinguemoji:\n` +
    `🌞 Magandang umaga, hapon, o gabi Chingus :chinguemoji:\n` +
    `🌞 Καλημέρα, απόγευμα ή βράδυ Chingus :chinguemoji:\n` +
    `🌞 Ohayō, konnichiwa, matawa konbanwa, chingasu :chinguemoji:\n` +
    `🌞 Buongiorno, buon pomeriggio o buonasera Chingus :chinguemoji:\n` +
    `🌞 Dzień dobry, lub dobry wieczór Czingusi :chinguemoji:\n` +
    `🌞 Bari aravot, Chinguner :chinguemoji:\n` +
    `🌞 Dobro jutro, dan ili veče Čingosi :chinguemoji:\n` +
    `🌞 Chingus صباح الخير ، مساء الخير :chinguemoji:\n` +
    `🌞 おはよう、午後、夕方、チンガス :chinguemoji:\n` +
    `🌞 E kaaro o, E kaasan o, E kaale o gbogbo’le Chingusi :chinguemoji:\n` +
    `🌞 Günaydın, iyi günler, iyi akşamlar Chingular :chinguemoji:\n` +
    `🌞 Доброе утро вечер или ночь Чингусы :chinguemoji:\n` +
    `🌞 Buna dimineața, după-amiază, sau seară Chingus :chinguemoji:\n` +
    `🌞 မင်္ဂလာမနက်ခင်း၊ နေ့လယ်ခင်း၊ ဒါမှမဟုတ် ညနေခင်းပါ Chingus :chinguemoji:\n` +
    `🌞 Добро утро, следобед или вечер Чингъс :chinguemoji:`;


module.exports = {
    data: new SlashCommandBuilder()
        .setName('greeting')
        .setDescription('Send a message to all channels in a category.')
        .addStringOption(option => option.setName('channel').setDescription('The ID of the channel.').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The message to send.').setRequired(true))
        .addStringOption(option => option.setName('header').setDescription('An optional header to display above the embed.').setRequired(false)),
    async execute(interaction) {
        try {
            // Check if the sender has the 'ADMINISTRATOR' permission
            if (interaction.member.permissions.has('ADMINISTRATOR')) {
                // Extract the category ID and message from the options
                const channelId = interaction.options.getString('channel');
                const message = interaction.options.getString('message');
                const header = interaction.options.getString('header');

                // Create an embed with the message
                const embed = new EmbedBuilder()
                    .setColor('#6DE194')
                    .setTitle('Chingu Admin Broadcast')
                    .setThumbnail('https://imgur.com/EII19bn.png')
                    .setFooter({ text: `Message sent by ${interaction.user.displayName}`, iconURL: 'https://imgur.com/EII19bn.png' })
                    .setDescription(defaultGreeting);

                // Get the channel from the specified ID
                const channel = interaction.guild.channels.cache.get(channelId);

                // Send the embed to the channel
                if (channel.type === 0) {
                    if (header) {
                    await channel.send({ content: header, embeds: [embed] });
                    } else {
                    await channel.send({ embeds: [embed] });
                    }
                };
                    
                await interaction.reply({ 
                content: `Message broadcasted successfully to category <#${categoryId}>.`,
                embeds: [embed]
                });
            } else {
                await interaction.reply('You do not have permission to use this command.');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while trying to broadcast the message.');
        }
    },
};                        