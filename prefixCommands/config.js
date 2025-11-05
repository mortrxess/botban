const fs = require('fs');
const path = require('path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  name: 'config',
  description: 'Associe un rôle à une permission puis configure les commandes accessibles.',
  async execute(message, args, client) {
    const { autorisation } = require('../utils/autorisation');
    if (!autorisation(message.member, 'config')) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Tu n'as pas la permission d'utiliser cette commande.")
            .setColor('2f3136'),
        ],
      });
    }

    let selectedRoles = [];

    const permPath = path.join(__dirname, '../data/permissions.json');
    if (!fs.existsSync(permPath)) fs.writeFileSync(permPath, JSON.stringify({}, null, 2));
    const permissions = JSON.parse(fs.readFileSync(permPath, 'utf8'));

    const addRolesBtn = new ButtonBuilder()
      .setCustomId('add_roles')
      .setLabel('Ajouter un/des rôles')
      .setStyle(ButtonStyle.Primary);

    const validateBtn = new ButtonBuilder()
      .setCustomId('validate')
      .setLabel('Valider')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true);

    const buttonRow = new ActionRowBuilder().addComponents(addRolesBtn, validateBtn);

    const embed = new EmbedBuilder()
      .setTitle('Configuration des permissions')
      .setDescription('> Clique sur `Ajouter un/des rôles` pour mentionner les rôles à configurer.')
      .setColor('#2f3136');

    const msg = await message.channel.send({ embeds: [embed], components: [buttonRow] });

    const buttonCollector = msg.createMessageComponentCollector({
      time: 60_000,
      filter: i => i.user.id === message.author.id,
    });

    buttonCollector.on('collect', async (interaction) => {
      if (interaction.customId === 'add_roles') {
        await interaction.reply({
          content: 'Mentionne les rôles à ajouter dans ce salon (tu as 20 secondes).',
          ephemeral: true,
        });

        const roleCollector = message.channel.createMessageCollector({
          time: 20_000,
          filter: m => m.author.id === message.author.id,
          max: 1,
        });

        roleCollector.on('collect', (m) => {
          const roles = m.mentions.roles;
          if (roles.size === 0) {
            interaction.followUp({ content: '❌ Aucun rôle mentionné.', ephemeral: true });
            return;
          }

          roles.forEach(r => {
            if (!selectedRoles.includes(r)) selectedRoles.push(r);
          });

          const roleList = selectedRoles.map(r => `<@&${r.id}>`).join('\n');
          const updatedEmbed = new EmbedBuilder()
            .setTitle('Configuration des permissions')
            .setDescription(`Rôles sélectionnés :\n${roleList}`)
            .setColor('#2f3136');

          validateBtn.setDisabled(false);

          interaction.followUp({
            content: `Rôles ajoutés : ${roles.map(r => `<@&${r.id}>`).join(', ')}`,
            ephemeral: true,
          });
          msg.edit({ embeds: [updatedEmbed], components: [buttonRow] }).catch(() => {});
        });
      }

      if (interaction.customId === 'validate') {
        if (selectedRoles.length === 0) {
          return interaction.reply({ content: 'Tu dois d\'abord ajouter au moins un rôle.', ephemeral: true });
        }

        buttonCollector.stop();

        const permSelect = new StringSelectMenuBuilder()
          .setCustomId('select_perm_level')
          .setPlaceholder('🛠️ Choisis un niveau de permission')
          .addOptions(
            Array.from({ length: 9 }, (_, i) => ({
              label: `Permission ${i + 1}`,
              value: String(i + 1),
              description: `Associer les rôles sélectionnés à la permission ${i + 1}`,
            }))
          );

        const permRow = new ActionRowBuilder().addComponents(permSelect);

        const embedPerm = new EmbedBuilder()
          .setTitle('Configuration des permissions')
          .setDescription(`> Sélectionne un **niveau de permission** à associer avec les rôles sélectionnés : ${selectedRoles.map(r => `<@&${r.id}>`).join(' ')}`)
          .setColor('#2f3136');

        await interaction.update({ embeds: [embedPerm], components: [permRow] });

        const permCollector = msg.createMessageComponentCollector({
          time: 60_000,
          filter: i => i.user.id === message.author.id,
        });

        permCollector.on('collect', async (i) => {
          if (i.customId === 'select_perm_level') {
            const permLevel = i.values[0];

            if (!permissions[permLevel]) {
              permissions[permLevel] = { roles: [], commands: [] };
            }

            for (const role of selectedRoles) {
              if (!permissions[permLevel].roles.includes(role.id)) {
                permissions[permLevel].roles.push(role.id);
              }
            }

            const allPrefixCommands = client.prefixCommands ? [...client.prefixCommands.keys()] : [];
            const allSlashCommands = client.commands ? [...client.commands.keys()] : [];
            const allCommands = [...new Set([...allPrefixCommands, ...allSlashCommands])].slice(0, 25);

            const commandSelect = new StringSelectMenuBuilder()
              .setCustomId(`select_commands_${permLevel}`)
              .setPlaceholder('📜 Choisis les commandes autorisées')
              .setMinValues(0)
              .setMaxValues(allCommands.length)
              .addOptions(
                allCommands.map(cmd => ({
                  label: cmd,
                  value: cmd,
                  description: `Autoriser ou non la commande "${cmd}"`,
                  default: permissions[permLevel].commands?.includes(cmd) ?? false,
                }))
              );

            const roles = permissions[permLevel]?.roles || [];
            const roleOptions = roles.map(roleId => {
              const role = message.guild.roles.cache.get(roleId);
              return {
                label: role ? role.name : `Rôle inconnu (${roleId})`,
                value: roleId
              };
            });

            const selectRemove = new StringSelectMenuBuilder()
              .setCustomId(`remove_roles_${permLevel}`)
              .setPlaceholder('🗑️ Sélectionne les rôles à retirer (optionnel)')
              .setMinValues(0)
              .setMaxValues(roleOptions.length)
              .addOptions(roleOptions);

            const commandRow = new ActionRowBuilder().addComponents(commandSelect);
            const removeRow = new ActionRowBuilder().addComponents(selectRemove);

            const validateFinalBtn = new ButtonBuilder()
              .setCustomId(`final_validate_${permLevel}`)
              .setLabel('✅ Valider les changements')
              .setStyle(ButtonStyle.Success);

            const validateRow = new ActionRowBuilder().addComponents(validateFinalBtn);

            await i.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`Permission ${permLevel}`)
                  .setDescription('> Choisis les commandes autorisées et/ou les rôles à retirer, puis clique sur **Valider les changements**.')
                  .setColor('#2f3136'),
              ],
              components: [commandRow, removeRow, validateRow],
            });

            let selectedCommands = permissions[permLevel].commands || [];
            let rolesToRemove = [];

            const subCollector = msg.createMessageComponentCollector({
              time: 60_000,
              filter: i => i.user.id === message.author.id,
            });

            subCollector.on('collect', async (interactionCmd) => {
              if (interactionCmd.customId === `select_commands_${permLevel}`) {
                selectedCommands = interactionCmd.values;
                await interactionCmd.deferUpdate();
              }

              if (interactionCmd.customId === `remove_roles_${permLevel}`) {
                rolesToRemove = interactionCmd.values;
                await interactionCmd.deferUpdate();
              }

              if (interactionCmd.customId === `final_validate_${permLevel}`) {
                permissions[permLevel].commands = selectedCommands;
                permissions[permLevel].roles = permissions[permLevel].roles.filter(r => !rolesToRemove.includes(r));
                fs.writeFileSync(permPath, JSON.stringify(permissions, null, 2));

                await interactionCmd.update({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle('✅ Configuration enregistrée')
                      .setDescription(
                        `> Les changements ont été appliqués pour la permission **${permLevel}**.\n\n**Rôles retirés :** ${rolesToRemove.length ? rolesToRemove.map(r => `<@&${r}>`).join(', ') : 'Aucun'}\n**Commandes autorisées :** \`${selectedCommands.join('`, `') || 'Aucune'}\``
                      )
                      .setColor('2f3136'),
                  ],
                  components: [],
                });

                subCollector.stop();
                permCollector.stop();
              }
            });
          }
        });
      }
    });
  },
};
