export default {
	callback: async (client, interaction) => {
		await interaction.deferReply(`${client.ws.ping}ms`);

		const reply = await interaction.fetchReply();

		const ping = reply.createdTimestamp - interaction.createdTimestamp;

		interaction.editReply(
			`Client: ${ping}ms | Websocket: ${client.ws.ping}ms`
		);
	},
	name: 'ping',
	description: 'Replies with the ping',
	// devOnly: Boolean,
	// testOnly: Boolean,
	// options: Object[],
	// deleted: Boolean.
	// permissionsRequired: PermissionFlagsBits[],
	// botPermissions: PermissionFlagsBits],
};
