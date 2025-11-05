const { Events,   ActionRowBuilder,
  TextDisplayComponent,
  ButtonBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ContainerBuilder,
  MessageFlags,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  SeparatorSpacingSize,} = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();


const separateur = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)       

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member, client) {
    
    const logChannelId = await db.get('logs_blacklist');

    const data = await db.get(`blacklist_${member.id}`);

    if (!data) return 
    
    const date = data.date ? `<t:${data.date}:F>` : 'Date inconnue';

  
    try {
      await member.kick({
        reason: `Blacklisté par ${data.auteurId} — ${data.raison || 'Aucune raison'}`
      })


        const embed = new ContainerBuilder()  
          .addSeparatorComponents(separateur) 
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# Utilisateur Blacklist à rejoint le serveur`))  
          .addSeparatorComponents(separateur)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`\`Utilisateur:\` <@${member.id}> (\`${member.id}\`)\n\`Auteur du blacklist:\` <@${data.auteurId}> (\`${data.auteurId}\`)\n\`Date:\` ${date}\n### Raison du blacklist:\n\`\`\`${data.raison || 'Aucune raison spécifiée'}\`\`\``))  
          .addSeparatorComponents(separateur)
    
      client.channels.cache.get(logChannelId).send({flags:MessageFlags.IsComponentsV2, components:[embed]})
      console.log(`✅ ${member.user.tag} a été automatiquement banni car il est blacklisté.`);
    } catch (err) {
      console.error(`❌ Impossible de bannir ${member.user.tag} :`, err);
    }
  }
};

