const Discord = require('discord.js');
const Schema = require('../../database/models/afk');

module.exports = async (client, interaction, args) => {
    // Make sure the command is used in a server
    if (!interaction.inGuild() || !interaction.guild || !interaction.member) {
        return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    const reason = interaction.options.getString('reason') || 'Not specified';

    Schema.findOne({ Guild: interaction.guild.id, User: interaction.user.id }, async (err, data) => {
        if (err) {
            console.error("AFK DB Error:", err);
            return client.errNormal({ 
                error: 'Something went wrong with the database.',
                type: 'editreply' 
            }, interaction);
        }

        if (data) {
            return client.errNormal({ 
                error: `You're already AFK!`,
                type: 'editreply' 
            }, interaction);
        }

        // Save new AFK record
        new Schema({
            Guild: interaction.guild.id,
            User: interaction.user.id,
            Message: reason
        }).save();

        // Set nickname if not already AFK-tagged
        if (!interaction.member.displayName.includes('[AFK] ')) {
            interaction.member.setNickname('[AFK] ' + interaction.member.displayName).catch(e => {
                console.warn("Couldn't set nickname:", e.message);
            });
        }

        client.succNormal({ 
            text: 'Your AFK has been set up successfully.',
            type: 'ephemeraledit'
        }, interaction);

        client.embed({ 
            desc: `${interaction.user} is now AFK! **Reason:** ${reason}` 
        }, interaction.channel);
    });
};
