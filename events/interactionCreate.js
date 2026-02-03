const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isMessageContextMenuCommand() &&
      !interaction.isUserContextMenuCommand()
    )
      return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const errMsg = `There was an error with this command!\n\`\`\`${error.toString()}\`\`\``;
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ ephemeral: true, content: errMsg });
      } else {
        await interaction.reply({ ephemeral: true, content: errMsg });
      }
    }
  }
};
