const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[AVERTISSEMENT] La commande à ${filePath} est invalide.`);
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`🔁 Déploiement de ${commands.length} commandes...`);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('✅ Commandes déployées avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement des commandes:', error);
  }
})();
