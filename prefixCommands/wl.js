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
const { QuickDB } = require('quick.db');
const db = new QuickDB();


const { toggleUserInGroup, listGroup } = require('../utils/authManager');

module.exports = {
  name: 'wl',
  description: 'Ajoute ou retire un whitelist, ou affiche la liste',
  async execute(message, args) {
 const separateur = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)       
    
    
    const { autorisation } = require('../utils/autorisation');
           if (!autorisation(message.member, 'wl')) {
             return message.reply({ embeds:[new EmbedBuilder()
              .setDescription("❌ Tu n'as pas la permission d'utiliser cette commande.")
               .setColor('2f3136')
             ] });
           }
const target = message.mentions.users.first() || (args[0] && await message.client.users.fetch(args[0]).catch(() => null));

    

    if (!target) {
      const owners = listGroup('wl');
    
     
      if (owners.length === 0) return message.reply({ embeds:[new EmbedBuilder()
             .setDescription(`Aucun wl défini.`)
              .setColor('2f3136')
            ] });
            
          
const embedss = new EmbedBuilder()
  .setColor('#2f3136')
  .setTitle(` # Liste des whitelist \n> Vous pouvez consulter la liste des whitelist en dessous de séparateur.`)
  .setDescription(
    owners.length > 0
      ? owners.map(id => `> <@${id}> (\`${id}\`)`).join('\n')
      : '> *Aucun whitelist défini*'
  );

return message.reply({ embeds: [embedss] });

    }

    const action = toggleUserInGroup('wl', target.id);
    if(action === 'added') {
              message.guild.channels.cache.get(await db.get('logs_owner')).send({embeds:[ new EmbedBuilder()
                .setDescription(`# Ajout à la liste blanche\n\`Auteur:\` <@${message.author.id}> (\`${message.author.id}\`)\n \`Nouveau WL:\`<@${target.id}> (\`${target.id}\`)`)
                .setTimestamp()
                .setColor('2f3136')
              ]})} else { 
              message.guild.channels.cache.get(await db.get('logs_owner')).send({embeds:[ new EmbedBuilder()
                .setDescription(`# Suppression de la liste blanche\n\`Auteur:\` <@${message.author.id}> (\`${message.author.id}\`)\n \`Ancien WL:\`<@${target.id}> (\`${target.id}\`)`)
                .setTimestamp()
                .setColor('2f3136')]})}
    const text = action === 'added'
      ? `> <@${target.id}> a été ajouté à la liste blanche.`
      : `> <@${target.id}> a été retiré à la liste blanche.`;

      return message.reply({ embeds:[new EmbedBuilder()
             .setDescription(text)
              .setColor('2f3136')
            ] });
            
  }
};
