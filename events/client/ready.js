module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
    client.user.setStatus('dnd'); 
    client.user.setActivity('discord.gg/naya', { type: 3 });
  },
};
