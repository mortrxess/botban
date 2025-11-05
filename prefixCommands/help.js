const {
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { autorisation } = require('../utils/autorisation');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Affiche les commandes disponibles selon vos permissions',

  async execute(message, args, client) {
    const commandsPath = path.join(__dirname);

    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    const accessiblePrefixCommands = [];

    for (const file of commandFiles) {
      const command = require(`./${file}`);
      if (!command.name || command.name === 'help') continue;
      if (autorisation(message.member, command.name)) {
        accessiblePrefixCommands.push({
          name: command.name,
          description: command.description || 'Aucune description.'
        });
      }
    }

    const accessibleSlashCommands = [];
    client.commands.forEach(cmd => {
      if (autorisation(message.member, cmd.data.name)) {
        accessibleSlashCommands.push({
          name: `/${cmd.data.name}`,
          description: cmd.data.description || 'Aucune description.'
        });
      }
    });

    if (accessiblePrefixCommands.length === 0 && accessibleSlashCommands.length === 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Tu n'as accès à aucune commande.")
            .setColor('#2f3136')
        ]
      });
    }

    const separateur = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
    const container = new ContainerBuilder()
    
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Page d'aide
> Liste des commandes disponibles selon tes permissions.\n`)
      )
      .addSeparatorComponents(separateur);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_menu')
      .setPlaceholder('Choisis une catégorie')
      .addOptions([
        { label: '📘 Commandes Prefix', value: 'prefix', description: 'Voir les commandes avec préfixe' },
        { label: '📘 Commandes Slash', value: 'slash', description: 'Voir les slash commands (/)' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    const msg = await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [container, row]
    });

    const collector = msg.createMessageComponentCollector({
      time: 60000,
      filter: i => i.user.id === message.author.id
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'help_menu') {
        const choice = interaction.values[0];
        let content = '';

        if (choice === 'prefix') {
          content = accessiblePrefixCommands
            .map(cmd => `> \`${cmd.name}\` — ${cmd.description}`)
            .join('\n') || 'Aucune commande prefix disponible.';
        } else if (choice === 'slash') {
          content = accessibleSlashCommands
            .map(cmd => `> \`${cmd.name}\` — ${cmd.description}`)
            .join('\n') || 'Aucune slash commande disponible.';
        }

        const updateContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ${choice === 'prefix' ? ' Commandes Prefix' : ' Commandes Slash'}`
            )
          )
          
      .addSeparatorComponents(separateur)
.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${content}`
            )
          )

        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: [updateContainer, row]
        });
      }
    });
  }
};
