const {
  SlashCommandBuilder,
  EmbedBuilder,
  SeparatorSpacingSize,
  SeparatorBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder
} = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB({});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('baninfo')
    .setDescription('>> Information sur un bannissement.')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('ID de l’utilisateur à débannir')
        .setRequired(true)
    ),

  async execute(interaction) {
    const { autorisation } = require('../utils/autorisation');

    if (!autorisation(interaction.member, 'unban')) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setDescription("> ❌ Tu n'as pas la permission d'utiliser cette commande.")
          .setColor('2f3136')],
        ephemeral: true
      });
    }

    const userId = interaction.options.getString('id');
    const banData = await db.get(`ban_${userId}`);

    if (!banData) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setDescription("> ❌ Aucun ban enregistré pour cet utilisateur.")
          .setColor('2f3136')],
        ephemeral: false
      });
    }

    
    const user = await interaction.client.users.fetch(banData.user).catch(() => null);
    const avatar = user ? user.displayAvatarURL({ extension: 'png', size: 256 }) : null;
    const date = banData.date ? `<t:${banData.date}:F>` : "Aucune date enregistrée";

    const separateur = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);


    const container = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`> ## 📖 Informations sur le bannissement de \`${user.tag || 'tag introuvable'}\`.`)
      )
      .addSeparatorComponents(separateur);


    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `> \`Auteur:\` <@${banData.auteur}> (\`${banData.auteur}\`)\n` +
        `> \`Victime:\` <@${banData.user}> (\`${banData.user}\`)\n` +
        `> \`Date:\` ${date}\n` +
        `### Raison\n\`\`\`${banData.raison || "Aucune raison"}\`\`\``
      )
    );

    return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
  }
};

