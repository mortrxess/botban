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
    .setName('ban')
    .setDescription('>> Bannir un utilisateur')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à bannir.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('Raison du bannissement')
        .setRequired(false)
    ),
    

  async execute(interaction) {

     const logChannelId = await db.get('logs_ban');
     var raisonc = interaction.options.getString('raison');

    const { autorisation, getUserLevel } = require('../utils/autorisation');
    if (!autorisation(interaction.member, 'ban')) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("> ❌ Tu n'as pas la permission d'utiliser cette commande.")
            .setColor('2f3136'),
        ], ephemeral:true
      });
    }
    
    if(!raisonc) raisonc = 'Aucune raison fourni'
    
     const separateur = new SeparatorBuilder()
     .setSpacing(SeparatorSpacingSize.Large)       
        
    const member = interaction.options.getMember('user');
    const level = getUserLevel(member)
    await interaction.deferReply({ ephemeral: true })

let isProtected = false;

if (['sys', 'wl', 'owners'].includes(level)) isProtected = true;
if (fs.existsSync(permPath)) {
  const perms = JSON.parse(fs.readFileSync(permPath, 'utf8'));
  
  for (const group in perms) {
    const groupRoles = perms[group]?.roles || [];
    if (groupRoles.some(roleId => member.roles.cache.has(roleId))) {
      isProtected = true;

    }
  }
}

    if(isProtected === true) {    
    const embed = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> :x: Impossible de bannir un membre ayant des permissions.`))
      .addSeparatorComponents(separateur);
    return interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [embed] })
    }

    const embed = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> Vous venez de bannir **${member.user.tag}** (<@${member.id}> — \`${member.id}\`).`))
      .addSeparatorComponents(separateur);

    const embeds = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> :x: Impossible de bannir cette utilisateur.`))
      .addSeparatorComponents(separateur);
      await member.ban({ reason: `Banni par ${interaction.user.tag}` }).catch(err => {  console.log(err)
        return interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [embeds] }); })

        
    const embedss = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ## Naya Ban :hammer: - Utilisateur banni`))
      .addSeparatorComponents(separateur)
      
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> \`Auteur:\` **${interaction.user.tag}** (<@${interaction.member.id}> — \`${interaction.user.id}\`)\n> \`Victime:\` **${member.user.tag}** (<@${member.id}> — \`${member.id}\`).\n### Raison \`\`\`${raisonc}\`\`\``))
    
       await targetMember.send({ content:`
> Vous avez été **banni** par ${interaction.user.tag}.
> **Raison :** ${raisonc
}

Si vous estimez que c’est une erreur, rejoignez le **tribunal** :
${ await db.get('tribunal')}` })
  

 interaction.guild.channels.cache.get(await db.get('logschannel')).send({ flags: MessageFlags.IsComponentsV2, components: [embedss] }); 

      await db.set(`ban_${member.id}`,
        {
        auteur: interaction.user.id,
        user: member.id,
        raison: raisonc,
        date: Math.floor(Date.now() / 1000)
        }
      )
    return interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [embed] });

    

  }
};
