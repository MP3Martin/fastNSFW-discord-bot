const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Get bot status'),
    async execute(interaction, client) {
        const exampleEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('__Hello World!__')
            .addFields(
                { name: '**Ping:**', value: `\`${Date.now() - interaction.createdTimestamp}ms\``, inline: true },
                { name: '**API Ping:**', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'fastNSFW bot by MP3Martin' });
        interaction.reply({ ephemeral: true, embeds: [exampleEmbed] });
    }
};
