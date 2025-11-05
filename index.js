const { Client, Collection,Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('./config.json');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.commands = new Collection();          
client.prefixCommands = new Collection();    
client.cooldowns = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[Avertissement] La commande Slash à ${file} est invalide.`);
  }
}
const prefixPath = path.join(__dirname, 'prefixCommands');
const prefixFiles = fs.readdirSync(prefixPath).filter(file => file.endsWith('.js'));

for (const file of prefixFiles) {
  const command = require(path.join(prefixPath, file));
  if ('name' in command && 'execute' in command) {
    client.prefixCommands.set(command.name, command);

    if (command.aliases) {
      for (const alias of command.aliases) {
        client.prefixCommands.set(alias, command);
      }
    }
  }
}

const eventsPath = path.join(__dirname, 'events');
const folders = fs.readdirSync(eventsPath);

for (const folder of folders) {
  const eventFiles = fs
    .readdirSync(path.join(eventsPath, folder))
    .filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, folder, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

client.login(token);
