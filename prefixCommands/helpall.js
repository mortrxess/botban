const fs = require('fs');
const path = require('path');
const { 
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize
} = require('discord.js');
const { autorisation } = require('../utils/autorisation');

module.exports = {
  name: 'helpall',
  description: 'Affiche les permissions définies et les commandes disponibles (prefix et slash)',
  
  async execute(message, args, client) {
    if (!autorisation(message.member, 'helpall')) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Tu n'as pas la permission d'utiliser cette commande.")
            .setColor('2f3136')
        ]
      });
    }

    const permPath = path.join(__dirname, '../data/permissions.json');
    if (!fs.existsSync(permPath)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("⚠️ Aucune configuration de permissions trouvée.")
            .setColor('2f3136')
        ]
      });
    }

    const perms = JSON.parse(fs.readFileSync(permPath, 'utf8'));
    const separateur = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Page d'aide complète
> Voici les commandes autorisées selon les niveaux de permissions.`)
      )
      .addSeparatorComponents(separateur);

    for (const [permLevel, data] of Object.entries(perms)) {
      const commands = Array.isArray(data.commands) ? data.commands : [];
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### Permission ${permLevel}\n${commands.length > 0 ? commands.map(cmd => `\`${cmd}\``).join(', ') : '*Aucune commande autorisée*'}`
        )
      );
    }

    const slashCommands = client.commands?.map(cmd => `\`/${cmd.data.name}\``) || [];

    container.addSeparatorComponents(separateur)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### Commandes Slash (${slashCommands.length})
${slashCommands.length > 0 ? slashCommands.join(', ') : '*Aucune commande slash enregistrée*'}`
        )
      );

    return message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });
  }
};
