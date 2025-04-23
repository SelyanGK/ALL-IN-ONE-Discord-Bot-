const Discord = require('discord.js');
const Schema = require("../../database/models/warnings");

module.exports = async (client, interaction, args) => {
    // Permission check
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageMessages],
        perms: [Discord.PermissionsBitField.Flags.ManageMessages]
    }, interaction);

    if (!perms) {
        return client.errNormal({
            error: "You don't have the required permissions to use this command!",
            type: 'editreply'
        }, interaction);
    }

    // Get user from interaction
    const member = interaction.options.getUser('user');

    if (!member) {
        return interaction.reply({
            content: "Please specify a valid user.",
            ephemeral: true
        });
    }

    // Find user warnings in database
    Schema.findOne({ Guild: interaction.guild.id, User: member.id }, async (err, data) => {
        if (err) {
            console.error("Warnings DB Error:", err);
            return client.errNormal({
                error: "There was an error fetching the warnings from the database.",
                type: 'editreply'
            }, interaction);
        }

        if (data) {
            const fields = data.Warnings.map(warning => ({
                name: `Warning **${warning.Case}**`,
                value: `Reason: ${warning.Reason}\nModerator: <@!${warning.Moderator}>`,
                inline: true
            }));

            client.embed({
                title: `${client.emotes.normal.error}・Warnings`,
                desc: `The warnings of **${member.tag}**`,
                fields: [
                    {
                        name: "Total",
                        value: `${data.Warnings.length}`,
                    },
                    ...fields
                ],
                type: 'editreply'
            }, interaction);
        } else {
            client.embed({
                title: `${client.emotes.normal.error}・Warnings`,
                desc: `User **${member.tag}** has no warnings!`,
                type: 'editreply'
            }, interaction);
        }
    });
};
