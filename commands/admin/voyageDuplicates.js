const { SlashCommandBuilder } = require('discord.js');
const Airtable = require("airtable");
const {nextVoyage} = require("../../utils/constants");
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voyageduplicates')
        .setDescription('Checks for duplicate signups for the next voyage'),
    async execute(interaction) {
        // Check if the command is used in the specific channels
        const allowedChannels = [process.env.ADMIN_TEST_ID, process.env.ADMIN_CHAT_ID];
        if (!allowedChannels.includes(interaction.channelId)) {
            return await interaction.reply({ content: 'You can only use this command in specific channels.', ephemeral: true });
        }

        try{
            if (interaction.member.permissions.has('ADMINISTRATOR')){
                const voyageSignups = await base('Voyage Signups').select({
                    filterByFormula: `Voyage = "V${nextVoyage}"`,
                    fields: ['Email']
                }).all();

                const emails = voyageSignups.map(r=>r.fields["Email"])
                const countsMap = emails.reduce((acc, email)=>acc.set(email, (acc.get(email) || 0) + 1), new Map());

                const countsArray = Array.from(countsMap, ([email, signups]) => ({email, signups}))
                const duplicates = countsArray.filter(e=>e.signups>1)

                await interaction.reply(`Duplicate Signups (V${nextVoyage}) - ${countsMap.size} unique ${JSON.stringify(duplicates)}`);
            }else{
                await interaction.reply('You do not have permission to use this command.');
            }

        }catch (e){
            console.log(e)
            await interaction.reply({ content: 'An error occurred while trying to fetch voyage signups', ephemeral: true });
        }
    },
};