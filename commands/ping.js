const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Get bot status'),
  async execute (interaction, client) {
    const backTick = '`';
    // interaction.reply(`Hello World!\nMessage id: ${backTick}${interaction.id}${backTick}`);

    const exampleEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('__Hello World!__')
    // .setAuthor({ name: 'Hello World!'})
      .addFields(
        { name: '**Ping:**', value: `${backTick}${Date.now() - interaction.createdTimestamp}ms${backTick}`, inline: true },
        { name: '**API Ping:**', value: `${backTick}${Math.round(client.ws.ping)}ms${backTick}`, inline: true }
      )
      .setTimestamp()
      .setFooter('fastNSFW bot by MP3Martin');
    interaction.reply({ ephemeral: true, embeds: [exampleEmbed] });
  }
};
