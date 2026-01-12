const { REST, Routes, Client, GatewayIntentBits, Collection, ActivityType, ChannelType } = require('discord.js');
const fs = require('node:fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const myToken = process.env.myToken;
const globalCommandsEnabled = 'true';
const testServerGuildId = process.env.testServerGuildId;

const isNsfwCategoryName = (name) => name.startsWith('🔞');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  client.user.setActivity('discord.js', { type: ActivityType.Listening });
  console.log('Bot is online');

  const CLIENT_ID = client.user.id;
  const rest = new REST({ version: '10' }).setToken(myToken);

  const commandData = client.commands.map(c => c.data.toJSON());

  try {
    if (globalCommandsEnabled === 'true') {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandData });
      console.log('Loaded global commands');
    } else {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, testServerGuildId), { body: commandData });
      console.log('Loaded local commands');
    }
  } catch (err) {
    if (err) console.error(err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: 'An error occurred while executing that command.',
      ephemeral: true
    });
  }
});

client.on('channelCreate', channel => {
  const nsfwPrefixes = ['nsfw-', 'nsfw_', 'nsfw+', 'ns-', 'ns_', 'ns+'];

  // Check channel name prefixes
  const prefix = nsfwPrefixes.find(p => channel.name.toLowerCase().startsWith(p));
  if (prefix) {
    channel.edit({ nsfw: true, name: channel.name.slice(prefix.length) }).catch(console.error);
    return;
  }

  // Check parent category
  if (channel.type !== ChannelType.GuildCategory && channel.parent?.name && isNsfwCategoryName(channel.parent.name)) {
    channel.edit({ nsfw: true }).catch(console.error);
  }
});

client.on('channelUpdate', (oldChannel, newChannel) => {
  // Category
  if (newChannel.type === ChannelType.GuildCategory) {
    const isNowNsfw = isNsfwCategoryName(newChannel.name);
    const wasNsfw = isNsfwCategoryName(oldChannel.name);

    if (wasNsfw && !isNowNsfw) {
      newChannel.children.cache.forEach(c => c.setNSFW(false).catch(console.error));
    } else if (!wasNsfw && isNowNsfw) {
      newChannel.children.cache.forEach(c => c.setNSFW(true).catch(console.error));
    }
    return;
  }

  // Channel

  const oldParentName = oldChannel.parent?.name;
  const newParentName = newChannel.parent?.name;

  if (oldParentName === newParentName) return;

  const isNewParentNsfw = newParentName && isNsfwCategoryName(newParentName);
  const isOldParentNsfw = oldParentName && isNsfwCategoryName(oldParentName);

  if (isOldParentNsfw && !isNewParentNsfw) {
    newChannel.setNSFW(false).catch(console.error);
  } else if (!isOldParentNsfw && isNewParentNsfw) {
    newChannel.setNSFW(true).catch(console.error);
  }
});

client.login(myToken);
