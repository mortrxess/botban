const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, '../data/auth.json');
const permPath = path.join(__dirname, '../data/permissions.json');

const wlOnlyCommands = ['help', 'helpall', 'baninfo'];
const ownersOnlyCommands = ['wl', 'ban', 'unban'];

/**
 * Retourne le niveau d’un utilisateur : "sys", "owner", "wl" ou null
 * @param {GuildMember} member
 * @returns {string|null}
 */
function getUserLevel(member) {
  if (!fs.existsSync(authPath)) return null;
  const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  const userId = member.id;

  if (auth.sys?.includes(userId)) return 'sys';
  if (auth.owners?.includes(userId)) return 'owner';
  if (auth.wl?.includes(userId)) return 'wl';
  return null;
}

/**
 * Vérifie les permissions de commande
 */
function autorisation(member, commandNames) {
  const userId = member.id;
  const commandList = Array.isArray(commandNames) ? commandNames : [commandNames];

  const auth = fs.existsSync(authPath)
    ? JSON.parse(fs.readFileSync(authPath, 'utf8'))
    : { owners: [], sys: [], wl: [] };

  if (auth.sys?.includes(userId)) return true;
  if (auth.owners?.includes(userId)) {
    const allOwnerAllowedCommands = [...wlOnlyCommands, ...ownersOnlyCommands];
    const allowedByOwnerList = commandList.some(cmd => allOwnerAllowedCommands.includes(cmd));
    if (allowedByOwnerList) return true;
  }

  if (auth.wl?.includes(userId)) {
    const allowed = commandList.some(cmd => wlOnlyCommands.includes(cmd));
    if (allowed) return true;
  }

  if (!fs.existsSync(permPath)) return false;
  const permissions = JSON.parse(fs.readFileSync(permPath, 'utf8'));

  for (const level in permissions) {
    const levelData = permissions[level];
    if (levelData.roles?.some(r => member.roles.cache.has(r))) {
      if (commandList.some(cmd => levelData.commands?.includes(cmd))) {
        return true;
      }
    }
  }

  return false;
}

module.exports = { autorisation, getUserLevel };
