const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { autorisation } = require('../utils/autorisation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perms')
    .setDescription('Affiche les rôles associés à chaque niveau de permission.'),

  async execute(interaction) {
    if (!autorisation(interaction.member, 'perms')) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Tu n'as pas la permission d'utiliser cette commande.")
            .setColor('2f3136')
        ],
        ephemeral: true
      });
    }

    const filePath = path.join(__dirname, '../data/permissions.json');
    if (!fs.existsSync(filePath)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("⚠️ Aucune configuration de permissions trouvée.")
            .setColor('2f3136')
        ],
        ephemeral: true
      });
    }

    const permissions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const guild = interaction.guild;

    const separateur = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Liste des permissions
> Permet de voir les rôles associés à chaque niveau de permission.\n`)
      )
      .addSeparatorComponents(separateur);

    for (const [permLevel, data] of Object.entries(permissions)) {
      const roles = (data.roles || [])
        .map(roleId => {
          const role = guild.roles.cache.get(roleId);
          return role ? `<@&${role.id}>` : `❓ Rôle inconnu (\`${roleId}\`)`;
        });

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### Permission ${permLevel}\n${roles.length > 0 ? roles.join(', ') : "↳ Aucun rôle assigné"}`
        )
      );
    }

    return interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
      ephemeral: true
    });
  }
};
