const fs = require('fs');
const path = require('path');
const authPath = path.join(__dirname, '../data/auth.json');

function readAuth() {
  if (!fs.existsSync(authPath)) {
    return { sys: [], owners: [], wl: [] };
  }
  return JSON.parse(fs.readFileSync(authPath, 'utf8'));
}

function writeAuth(auth) {
  fs.writeFileSync(authPath, JSON.stringify(auth, null, 2));
}

function toggleUserInGroup(group, userId) {
  const auth = readAuth();
  const list = auth[group] || [];

  const index = list.indexOf(userId);
  let action;

  if (index === -1) {
    list.push(userId);
    action = 'added';
  } else {
    list.splice(index, 1);
    action = 'removed';
  }

  auth[group] = list;
  writeAuth(auth);

  return action; 
}

function listGroup(group) {
  const auth = readAuth();
  return auth[group] || [];
}

module.exports = { toggleUserInGroup, listGroup };
