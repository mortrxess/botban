const { EmbedBuilder } = require('discord.js')

const embederror = new EmbedBuilder()
.setDescription('❌ Vous n\'avez pas les permissions nécessaires.')
.setColor('2f3136')


module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
      }
    }

  } }