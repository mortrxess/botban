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
const fs = require('fs');
const path = require('path');
const { voiceJoinTimestamps } = require('../events/message/voice'); 

const configPath = path.join(__dirname, '..', 'config.json');

module.exports = {
  name: 'prefix',
  description: 'Change le prefix',
  async execute(message, args,context) {
 const separateur = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)       
    
    const { autorisation } = require('../utils/autorisation');
           if (!autorisation(message.member, 'prefix')) {
             return message.reply({ embeds:[new EmbedBuilder()
              .setDescription("❌ Tu n'as pas la permission d'utiliser cette commande.")
               .setColor('2f3136')
             ] });
           }
const newPrefix = args[0];
    if (!newPrefix) return message.reply('`prefix !`');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.prefix = newPrefix;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    if (context?.prefix) context.prefix(newPrefix);


    const embed = new ContainerBuilder()
.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`> Préfixe changé en \`${newPrefix}\``))
  message.reply({flags:MessageFlags.IsComponentsV2, components:[embed]})

    
            
  }
};
