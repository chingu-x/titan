import { SlashCommandBuilder } from 'discord.js';
import { base, adminChatID, adminTestID } from '../../handlers/airtable.js';
import { getNextVoyage, nextVoyageNumber } from '../../utils/constants.js';


export default {
    data: new SlashCommandBuilder()
        .setName('voyageduplicates')
        .setDescription('Checks for duplicate signups for the next voyage'),
    async execute(interaction) {
        // Check if the command is used in the specific channels
        const allowedChannels = [adminChatID, adminTestID];
        if (!allowedChannels.includes(interaction.channelId)) {
            return await interaction.reply({ content: 'You can only use this command in specific channels.', ephemeral: true });
        }

        try{
            if (interaction.member.permissions.has('ADMINISTRATOR')){
                const nextVoyage = nextVoyageNumber || await getNextVoyage();

                if (!nextVoyage) {
                    return await interaction.reply({ content: 'No next voyage found.', ephemeral: true });
                }

                const voyageSignups = await base('Voyage Signups').select({
                    filterByFormula: `Voyage = "${nextVoyage}"`,
                    fields: ['Email']
                }).all();

                const emails = voyageSignups.map(r=>r.fields["Email"])
                const countsMap = emails.reduce((acc, email)=>acc.set(email, (acc.get(email) || 0) + 1), new Map());

                const countsArray = Array.from(countsMap, ([email, signups]) => ({email, signups}))
                const duplicates = countsArray.filter(e=>e.signups>1)

                let duplicatesMessage = `Duplicate Signups (${nextVoyage}) - ${countsMap.size} unique\n${duplicates.length} duplicates:\n`;
                duplicates.forEach(duplicate => {
                    duplicatesMessage += `Email: ${duplicate.email}, Signups: ${duplicate.signups}\n`;
                });

                // Send the duplicates message as the reply to the interaction
                await interaction.reply(duplicatesMessage);
            }else{
                await interaction.reply('You do not have permission to use this command.');
            }

        }catch (e){
            console.log(e)
            await interaction.reply({ content: 'An error occurred while trying to fetch voyage signups', ephemeral: true });
        }
    },
};
