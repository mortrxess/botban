
const activePvRooms = new Map(); 

module.exports = {
  addPv(userId, channelId) {
    activePvRooms.set(userId, channelId);
  },
  removePv(userId) {
    activePvRooms.delete(userId);
  },
  isPvProtected(channelId) {
    return [...activePvRooms.values()].includes(channelId);
  },
  getOwnerByChannel(channelId) {
    return [...activePvRooms.entries()].find(([_, ch]) => ch === channelId)?.[0];
  },
  getAll() {
    return activePvRooms;
  },
  getAllPvs() {
  const list = [];
  for (const [ownerId, channelId] of activePvRooms.entries()) {
    list.push({ ownerId, channelId });
  }
  return list;
}

};
