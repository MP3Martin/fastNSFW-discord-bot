const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get bot info and features'),
  async execute (interaction, client) {
    // const backTick = '`';
    const serverIcon = interaction.guild.iconURL();
    // interaction.reply(`Hello World!\nMessage id: ${backTick}${interaction.id}${backTick}`);

    console.log(serverIcon);

    const exampleEmbed = new MessageEmbed()
      .setColor('#0099ff')
      // .setTitle('**Help Menu**')
      .setDescription('Bot commands and features')
      .setThumbnail(serverIcon)
      // .setURL('https://discord.gg/W4MjVCwMjh')
      .setAuthor({ name: 'Help Menu' })
      .addFields(
        {
          name: '**╾╴ <:slash:782701715479724063> Commands ╶╼**', value: `\`help\`, \`ping\`
                \u200B
                `
        },
        {
          name: '**╾╴ <:rich_presence:658538493521166336> Features ╶╼**',
          value:
            `**__Create NSFW channel__**
  └─ Just create a channel with name starting with one of the prefixes. The prefix will get removed from the channel name and the channel will get marked as NSFW.
  All the channel name prefixes you can use: **\`nsfw-\`**, **\`nsfw_\`**, **\`nsfw+\`**, **\`ns-\`**, **\`ns_\`**, **\`ns+\`**

**__NSFW categories__**
  └─ Include \`🔞\` before the category name. All the channels in the category will be set as NSFW. Remove \`🔞\` prefix from category name and the category channels will not be NSFW again. The bot also handles if you create a channel inside the NSFW category or move a channel in / out of NSFW category.
  It basically works like if NSFW categories were official. The only difference is that you have to write \`🔞\` before the category name instead of toggling a switch.
`
        },
        { name: '\u200B', value: '[Invite Me!](https://discord.bots.gg/bots/987366356808773642) | [Support Server](https://discord.com/invite/VGGxCg2)' }
      )
      .setTimestamp()
      .setFooter('fastNSFW BOT by MP3Martin');
    interaction.reply({ embeds: [exampleEmbed] });
  }
};
