import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default {
	callback: async (client, interaction) => {
		const targetUserId = interaction.options.get('user').value;
		const reason =
			interaction.options.get('reason')?.value || 'No reason provided';

		await interaction.deferReply();

		const targetUser = await interaction.guild.members.fetch(targetUserId);

		if (!targetUser) {
			await interaction.editReply(
				'The user does not exist in the server'
			);
			return;
		}

		if (targetUser.id === interaction.guild.ownerId) {
			await interaction.editReply(
				'You cannot ban the owner of the server'
			);
			return;
		}

		const targetUserRolePosition = targetUser.roles.highest.position;
		const requestUserRolePosition =
			interaction.member.roles.highest.position;
		const botRolePosition =
			interaction.guild.members.me.roles.highest.position;

		if (targetUserRolePosition >= requestUserRolePosition) {
			await interaction.editReply('The user role is too high');
			return;
		}

		if (targetUserRolePosition >= botRolePosition) {
			await interaction.editReply('The user role is too high');
			return;
		}

		try {
			await targetUser.ban({ reason });
			await interaction.editReply(
				`User ${targetUser} was banned\nReason: ${reason}`
			);
		} catch (error) {
			console.log(`Error in ban.js: ${error}`);
		}
	},
	name: 'ban',
	description: 'Ban user',
	// devOnly: Boolean,
	// testOnly: Boolean,
	options: [
		{
			name: 'user',
			description: 'User to ban',
			required: true,
			type: ApplicationCommandOptionType.Mentionable,
		},
		{
			name: 'reason',
			description: 'Reason for ban',
			type: ApplicationCommandOptionType.String,
		},
	],
	permissionsRequired: [PermissionFlagsBits.Administrator],
	botPermissions: [PermissionFlagsBits.BanMembers],
};
