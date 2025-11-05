const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  SeparatorSpacingSize,SeparatorBuilder,
ContainerBuilder, TextDisplayBuilder, MessageFlags
} = require('discord.js');
const {QuickDB} = require('quick.db')
const db = new QuickDB({})
const fs = require('fs');
const path = require('path');
const permPath = path.join(__dirname, '../data/permissions.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('>> Débannir un utilisateur via son ID')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('ID de l’utilisateur à débannir')
        .setRequired(true)
    ),
    

  async execute(interaction, client) {

     const logChannelId = await db.get('logschannel')
    const { autorisation, getUserLevel } = require('../utils/autorisation');
    if (!autorisation(interaction.member, 'unban')) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("> ❌ Tu n'as pas la permission d'utiliser cette commande.")
            .setColor('2f3136'),
        ], ephemeral:true
      });
    }
    

    
     const separateur = new SeparatorBuilder()
     .setSpacing(SeparatorSpacingSize.Large)       
        
    const userId = interaction.options.getString('id');

const member = interaction.client.users.cache.get(userId) || await interaction.client.users.fetch(userId).catch(() => null);
    await interaction.deferReply({ ephemeral: true })

    const embed = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> Vous venez de débannir **${member.id}** (<@${member.id}> — \`${member.id}\`).`))
      .addSeparatorComponents(separateur);

    const embeds = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> :x: Impossible de trouvé l'utilisateur.`))
      .addSeparatorComponents(separateur);
            await interaction.guild.members.unban(userId, `Débanni par ${interaction.user.tag}`).catch(err => { return })
      if(logChannelId) {
    const embedss = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ## Naya UnBan :hammer: - Utilisateur débanni`))
      .addSeparatorComponents(separateur)
      
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> <@${interaction.member.id}> (<@${interaction.member.id}> — \`${interaction.user.id}\`) à débanni **${member.user.tag}** (<@${member.id}> — \`${member.id}\`).`))
    
 interaction.guild.channels.cache.get(logChannelId).send({ flags: MessageFlags.IsComponentsV2, components: [embedss] }); 

      }
    return interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [embed] });

    

  }
};
