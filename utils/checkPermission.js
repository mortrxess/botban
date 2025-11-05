const fs = require('fs');
const path = require('path');

const permissionsPath = path.join(__dirname, '../data/permissions.json');

function checkUserPermission(member, commandName) {
  if (!fs.existsSync(permissionsPath)) return false;

  const permissions = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));

  for (const level of Object.keys(permissions)) {
    const { roles, commands } = permissions[level];

    if (roles.some(roleId => member.roles.cache.has(roleId))) {
      if (commands.includes(commandName)) {
        return true;
      }
    }
  }

  return false;
}

module.exports = checkUserPermission;
