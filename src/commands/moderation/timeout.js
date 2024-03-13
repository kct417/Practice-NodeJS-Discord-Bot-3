import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';

export default {
	/**
	 *
	 * @param {import('discord.js').Client} client
	 * @param {import('discord.js').Interaction} interaction
	 */
	callback: async (client, interaction) => {
		const targetUserId = interaction.options.get('user').value;
		const duration = interaction.options.get('duration').value;
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

		if (targetUser.user.bot) {
			await interaction.editReply('You cannot timeout a bot');
			return;
		}

		const msDuration = ms(duration);

		if (isNaN(msDuration)) {
			await interaction.editReply('Invalid timeout duration');
			return;
		}

		if (msDuration < 5000 || msDuration > 2.419e9) {
			await interaction.editReply(
				'Timeout duration must be between 5s and 28d'
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
			const { default: prettyMs } = await import('pretty-ms');

			if (targetUser.isCommunicationDisabled) {
				await targetUser.timeout(msDuration, reason);
				await interaction.editReply(
					`User ${targetUser} timeout updated to ${prettyMs(
						msDuration,
						{ verbose: true }
					)}\nReason: ${reason}`
				);
				return;
			}

			await targetUser.timeout(msDuration, reason);
			await interaction.editReply(
				`User ${targetUser} was timed out for ${prettyMs(msDuration, {
					verbose: true,
				})}\nReason: ${reason}`
			);
		} catch (error) {
			console.log(`Error in timeout.js: ${error}`);
		}
	},
	name: 'timeout',
	description: 'Timeout user',
	// devOnly: Boolean,
	// testOnly: Boolean,
	options: [
		{
			name: 'user',
			description: 'User to timeout',
			required: true,
			type: ApplicationCommandOptionType.Mentionable,
		},
		{
			name: 'duration',
			description: 'Timeout duration (30m, 1h, 1d)',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'reason',
			description: 'Reason for timeout',
			type: ApplicationCommandOptionType.String,
		},
	],
	// deleted: Boolean.
	permissionsRequired: [PermissionFlagsBits.MuteMembers],
	botPermissions: [PermissionFlagsBits.MuteMembers],
};
