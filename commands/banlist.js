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
    .setName('banlist')
    .setDescription('>> Liste des bannissement')
  ,

  async execute(interaction, client) {
    const { autorisation } = require('../utils/autorisation');

    if (!autorisation(interaction.member, 'banlist')) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setDescription("> ❌ Tu n'as pas la permission d'utiliser cette commande.")
          .setColor('2f3136')],
        ephemeral: true
      });
    }

      const allKeys = await db.all();

const separateur = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)    
  // Filtre celles qui commencent par "ban_"
  const bannedUsers = allKeys.filter(entry => entry.id.startsWith("ban_"));

    const container = new ContainerBuilder()
      .addSeparatorComponents(separateur)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`> ## 📖 Informations sur tout les bannissements du serveur.`)
      )
      .addSeparatorComponents(separateur);

bannedUsers.forEach(u => {

   const userId = u.id.replace("ban_", "");
    const data = u.value;

    // Si tu stockes un objet comme { auteur, raison, date } :
    const auteur = data?.auteur ? `<@${data.auteur}>` : "Inconnu";
    const raison = data?.raison || "Non spécifiée";
    const tag = data?.user || "Non spécifiée";
    const date = data?.date || "Date non enregistrée";


 container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### <@${client.users.fetch(tag).tag}>\n>>> \`Auteur:\`${auteur} (\`${data.auteur}\`)\n\`Raison:\` **${raison}**\n\`Date:\` <t:${date}>\n`))
      .addSeparatorComponents(separateur)
})

   

    return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
  }
};
