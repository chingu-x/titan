const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("standup")
    .setDescription(
      "Replies with a daily standup form for a team member fill out",
    ),
  async execute(interaction) {
    await interaction.reply(
      `This command was run by ${interaction.user.username}.`,
    );
  },
};
