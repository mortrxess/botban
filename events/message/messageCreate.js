const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const configPath = path.join(__dirname, '../../config.json');
    const { prefix } = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`Erreur dans la commande ${commandName}:`, error);
      message.reply('❌ Une erreur est survenue en exécutant cette commande.');
    }
  }
};
