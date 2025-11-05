const fs = require('fs');
const path = require('path');
const {
  ActionRowBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  SeparatorBuilder,
  ContainerBuilder,
  MessageFlags,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  SeparatorSpacingSize,
} = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'logs',
  description: 'Configurer les logs et afficher les protections actives. [ban/perms/ownerlogs]',
  async execute(message, args) {
    const separateur = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

    const { autorisation } = require('../utils/checkPermissionOrAuth');
    if (!autorisation(message.member, 'logs')) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Tu n'as pas la permission d’utiliser cette commande.")
            .setColor('2f3136'),
        ],
      });
    }


    if (args[0]?.toLowerCase() === 'ban') {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('> ⚠️ Veuillez mentionner un salon.');
      await db.set('logschannel', channel.id);
      return message.reply(`> ✅ Salon de logs défini sur ${channel}`);
    }

        if (args[0]?.toLowerCase() === 'perms') {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply('> ⚠️ Veuillez mentionner un salon.');
      await db.set('logs_owner', channel.id);
      return message.reply(`> ✅ Salon de logs défini sur ${channel}`);
    }

        if (args[0]?.toLowerCase() === 'tribunal') {
      await db.set('tribunal', args[1]);
      return message.reply(`> ✅ Serveur du tribunal défini sur ${args[1]}`);
    }

  const embed = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ## 🛡️ Naya Ban — Logs`))
        .addSeparatorComponents(separateur)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`>>> **Logs des ban**: ${await db.get('logschannel') || `\`Aucun salon.\``}\n**Logs Owner**: ${await db.get('ownerlogs') || `\`Aucun salon.\``}\n**Tribunal**: ${await db.get('tribunal') || `\`Aucun salon.\``}`))
        .addSeparatorComponents(separateur)
        
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`>>> `))
        .addSeparatorComponents(separateur)
      message.reply({ components: [embed], flags:MessageFlags.IsComponentsV2 });
      
  },
};
