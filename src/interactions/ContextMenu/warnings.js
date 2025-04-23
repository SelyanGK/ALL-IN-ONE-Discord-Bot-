const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Schema = require("../../database/models/warnings");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View the warnings of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        // Get the member from the interaction
        const member = interaction.member;

        // Check if the user has ManageMessages permission or is the server owner
        const isOwner = interaction.guild.ownerId === interaction.user.id;
        const hasPermission = member.permissions.has(PermissionsBitField.Flags.ManageMessages);

        if (!hasPermission && !isOwner) {
            return client.errNormal({
                error: "You don't have the required permissions to use this command!",
                type: 'editreply'
            }, interaction);
        }

        // Get the member to check their warnings
        const user = interaction.options.getUser('user');
        if (!user) {
            return interaction.reply({
                content: "Please specify a valid user.",
                ephemeral: true
            });
        }

        // Check the database for warnings
        Schema.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, data) => {
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
                    desc: `The warnings of **${user.tag}**`,
                    fields: [
                        { name: "Total", value: `${data.Warnings.length}` },
                        ...fields
                    ],
                    type: 'editreply'
                }, interaction);
            } else {
                client.embed({
                    title: `${client.emotes.normal.error}・Warnings`,
                    desc: `User **${user.tag}** has no warnings!`,
                    type: 'editreply'
                }, interaction);
            }
        });
    }
};
