const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const { Client, Intents, Collection } = require('discord.js');
// const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

// const prefix = '!';
const myToken = process.env.myToken;
const globalCommandsEnabled = 'true';
const testServerGuildId = process.env.testServerGuildId; // l bot test

// function range (start, stop, step) {
//   if (stop == null) {
//     stop = start || 0;
//     start = 0;
//   }
//   if (!step) {
//     step = stop < start ? -1 : 1;
//   }

//   const length = Math.max(Math.ceil((stop - start) / step), 0);
//   const range = Array(length);

//   for (let idx = 0; idx < length; idx++, start += step) {
//     range[idx] = start;
//   }

//   return range;
// }

function isNsfwCategoryName (name) {
  /* eslint-disable-next-line eqeqeq */
  if (name.substring(0, 2) == '🔞') {
    return true;
  } else {
    return false;
  }
}

// async function clearChat (mChannelId, numb) {
//   const myGuild = client.guilds.cache.get(testServerGuildId);
//   const channel = myGuild.channels.cache.get(mChannelId);
//   const messageManager = channel.messages;
//   const messages = await messageManager.channel.messages.fetch({ limit: numb });
//   channel.bulkDelete(messages, true).then(e => {
//     return 'e';
//   });
// }

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  //   const backTick = '`';

  client.user.setActivity('discord.js', { type: 'LISTENING' });
  console.log('Bot is online');

  // THIS CODE IS NOT USED:
  //   console.log('\n--- Bot is in these servers: ---');
  //   client.guilds.cache.forEach(guild => {
  //     console.log(`${guild.name} | ${guild.id}`);
  //   });
  //   console.log('--------------------------------\n');

  // -- LOAD SLASH COMMANDS -- //
  const CLIENT_ID = client.user.id;
  const rest = new REST({
    version: '9'
  }).setToken(myToken);

  (async () => {
    try {
      if (globalCommandsEnabled === 'true') {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands
        });
        console.log('Loaded global commands');
      } else {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, testServerGuildId), {
          body: commands
        });
        console.log('Loaded local commands');
      }
    } catch (err) {
      if (err) console.error(err);
    }
  })();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    if (err) console.error(err);

    await interaction.reply({
      content: 'An error occurred while executing that command.',
      ephemeral: true
    });
  }
});

// client.on('message', message => {
//   if (!message.content.startsWith(prefix) || message.author.bot) return;

//   const args = message.content.slice(prefix.length).split(/ +/);
//   const command = args.shift().toLowerCase();
// });

client.on('channelCreate', channel => {
  // -- Channel prefixes --\\
  const nsfwPrefixes = ['nsfw-', 'nsfw_', 'nsfw+', 'ns-', 'ns_', 'ns+'];

  for (const i of nsfwPrefixes) {
    if (channel.name.toLowerCase().startsWith(i.toLowerCase())) {
      try {
        channel.setNSFW();
        channel.setName(channel.name.substring(i.length));
      } catch (error) { }
    }
  }

  // -- NSFW categories --\\
  // set nsfw
  if (!channel.type.toLowerCase().includes('category') && channel.parent.name.startsWith('🔞')) {
    try {
      channel.setNSFW(true);
    } catch (e) {
      console.log(`HANDLED: ${e}`);
    }
  }
});

client.on('channelUpdate', function (oldChannel, newChannel) {
  // -- NSFW categories --\\
  // set nsfw
  if (!isNsfwCategoryName(oldChannel.name) && isNsfwCategoryName(newChannel.name) && newChannel.type.toLowerCase().includes('category')) {
    const category = newChannel;
    const channels = Array.from(category.children.values());
    for (const channel of channels) { // for each channel of channels...
      channel.setNSFW(true);
    }
  }

  // unset nsfw
  /* eslint-disable-next-line eqeqeq */
  if (oldChannel.name.substring(0, 2) == '🔞' && newChannel.name.substring(0, 2) != '🔞' && newChannel.type.toLowerCase().includes('category')) {
    const category = newChannel;
    const channels = Array.from(category.children.values());
    for (const channel of channels) { // for each channel of channels...
      channel.setNSFW(false);
    }
  }

  let oldChannel2 = { parent: { name: '-' } };
  let newChannel2 = JSON.parse(JSON.stringify(oldChannel2));

  if (oldChannel.parent == null) {
    oldChannel2.parent.name = 'iughjjij';
  } else {
    oldChannel2 = oldChannel;
  }

  if (newChannel.parent == null) {
    newChannel2.parent.name = 'iughjjij';
  } else {
    newChannel2 = newChannel;
  }

  // set nsfw
  if (!isNsfwCategoryName(oldChannel2.parent.name) && isNsfwCategoryName(newChannel2.parent.name) && !newChannel.type.toLowerCase().includes('category')) {
    newChannel.setNSFW(true);
  }

  // unset nsfw
  if (isNsfwCategoryName(oldChannel2.parent.name) && !isNsfwCategoryName(newChannel2.parent.name) && !newChannel.type.toLowerCase().includes('category')) {
    newChannel.setNSFW(false);
  }
});

// const interval = setInterval(function () {
//   // nothing
// }, 400 * 1000);

client.login(myToken);
