const {
  ActionRowBuilder,
  TextDisplayComponent,
  ButtonBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ContainerBuilder,
  MessageFlags,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  SeparatorSpacingSize,
} = require('discord.js');
const { toggleUserInGroup, listGroup } = require('../utils/authManager');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'owner',
  description: 'Ajoute ou retire un owner, ou affiche la liste',
  async execute(message, args) {
 const separateur = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)       
    
    
    const { autorisation } = require('../utils/autorisation');
           if (!autorisation(message.member, 'owners')) {
             return message.reply({ embeds:[new EmbedBuilder()
              .setDescription("❌ Tu n'as pas la permission d'utiliser cette commande.")
               .setColor('2f3136')
             ] });
           }
    const target = message.mentions.users.first() || (args[0] && await message.client.users.fetch(args[0]).catch(() => null));

    

    if (!target) {
      const owners = listGroup('owners');
    
     
      if (owners.length === 0) return message.reply({ embeds:[new EmbedBuilder()
             .setDescription(`Aucun owner défini.`)
              .setColor('2f3136')
            ] });
            
          
const embedss = new EmbedBuilder()
  .setColor('#2f3136')
  .setTitle(` Liste des owners \n> Vous pouvez consulter la liste des owners en dessous de séparateur.`)
  .setDescription(
    owners.length > 0
      ? owners.map(id => `> <@${id}> (\`${id}\`)`).join('\n')
      : '> *Aucun owner défini*'
  );

return message.reply({ embeds: [embedss] });

    }

    const action = toggleUserInGroup('owners', target.id);
    if(action === 'added') {
              message.guild.channels.cache.get(await db.get('logs_owner')).send({embeds:[ new EmbedBuilder()
                .setDescription(`# Ajout d'un OWner\n\`Auteur:\` <@${message.author.id}> (\`${message.author.id}\`)\n \`Nouveau Owner:\`<@${target.id}> (\`${target.id}\`)`)
                .setTimestamp()
                .setColor('2f3136')
              ]})} else { 
              message.guild.channels.cache.get(await db.get('logs_owner')).send({embeds:[ new EmbedBuilder()
                .setDescription(`# Suppression d'un Owner\n\`Auteur:\` <@${message.author.id}> (\`${message.author.id}\`)\n \`Ancien Owner:\`<@${target.id}> (\`${target.id}\`)`)
                .setTimestamp()
                .setColor('2f3136')]})}
    const text = action === 'added'
      ? `> <@${target.id}> a été ajouté comme owner.`
      : `> <@${target.id}> a été retiré des owners.`;

      return message.reply({ embeds:[new EmbedBuilder()
             .setDescription(text)
              .setColor('2f3136')
            ] });
            
  }
};
