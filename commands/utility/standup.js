const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder, 
  ButtonStyle
} = require('discord.js');
const cron = require('node-cron');
const standupJobs = new Map();

// Modular function to create a TextInput
const createTextInput = (id, label, placeholder) =>
  new TextInputBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setPlaceholder(placeholder)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('standup')
    .setDescription('Replies with a daily standup form for a team member to fill out')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('The time to schedule the daily standup (24-hour format, e.g. 14:30)')
        .setRequired(false)),
  async execute(interaction) {
    const time = interaction.options.getString('time');
    const roleToPing = '1095454063665094679';

    if (time) {
      // Store the channelId and client
      const channelId = interaction.channel.id;
      const client = interaction.client;
    
      // Schedule the standup
      const job = cron.schedule(`${time.split(':')[1]} ${time.split(':')[0]} * * *`, async () => {
        const channel = await client.channels.fetch(channelId);
        await channel.send({
          content: `<@&${roleToPing}>, please fill out the daily standup form.`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('openStandupModal')
                .setLabel('Open Standup Form')
                .setStyle(ButtonStyle.PRIMARY),
            ),
          ],
        });
      });
      standupJobs.set(interaction.user.id, job);
      await interaction.reply('Standup scheduled successfully.');
    } else {
      const modal = new ModalBuilder()
        .setCustomId(`standupModal-${interaction.user.id}`)
        .setTitle('Daily Standup Form');

      const name = interaction.user.globalName || interaction.user.username;

      // Create text inputs
      const createAndAddTextInput = (id, label, placeholder) => {
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            createTextInput(id, label, placeholder),
          ),
        );
      };

      createAndAddTextInput(
        'yesterdayInput',
        'what did you do yesterday?',
        'e.g. Had a sprint planning meeting',
      );

      createAndAddTextInput(
        'todayInput',
        'what are you doing today?',
        'e.g. start working on the project\'s backlog',
      );

      createAndAddTextInput(
        'blockersInput',
        'what blockers do you have?',
        'e.g. had no internet connection',
      );

      await interaction.showModal(modal);

      // Wait for modal to be submitted
      function filter(interaction) {
        return interaction.customId === `standupModal-${interaction.user.id}`;
      }

      interaction
        .awaitModalSubmit({ filter, time: 300000 })
        .then(async (modalInteraction) => {
          try {
            const yesterday =
              modalInteraction.fields.getTextInputValue('yesterdayInput');
            const today = modalInteraction.fields.getTextInputValue('todayInput');
            const blockers =
              modalInteraction.fields.getTextInputValue('blockersInput');

            // Validate inputs
            if (!yesterday || !today || !blockers) {
              throw new Error('Please fill out all fields.');
            }

            const response = new EmbedBuilder()
              .setColor('#6DE194')
              .setTitle('Daily Standup')
              .addFields(
                { name: 'Yesterday:', value: yesterday },
                { name: 'Today:', value: today },
                { name: 'Blockers:', value: blockers },
              )
              .setFooter({
                text: `standup by ${name}`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTimestamp();

            await modalInteraction.reply({ embeds: [response] });
          } catch (error) {
            console.error('An error occurred:', error);
            modalInteraction.reply({
              content: 'An error occurred. Please try again later.',
              ephemeral: true,
            });
          }
        })
        .catch((error) => {
          console.error(
            'Modal submission timed out or another error occurred:',
            error,
          );
          interaction.followUp({
            content:
              'Modal submission timed out or another error occurred. Please try again later.',
            ephemeral: true,
          });
        });
    }
  },
};