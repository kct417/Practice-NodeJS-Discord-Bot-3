import { fileURLToPath } from "url";
import path from "path";
import getAllFiles from "./getAllFiles.js";

export default async (exceptions = []) => {
	let localCommands = [];

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const commandCategories = getAllFiles(
		path.join(__dirname, "..", "commands"),
		true
	);

	for (const commandCategory of commandCategories) {
		const commandFiles = getAllFiles(commandCategory);

		for (const commandFile of commandFiles) {
			const filePath = path.resolve(
				__dirname,
				"..",
				"commands",
				commandCategory,
				commandFile
			);
			const fileURL = `file://${filePath.replace(/\\/g, "/")}`;
			const { default: commandObject } = await import(fileURL);

			if (commandObject && commandObject.name) {
				const { name: commandName } = commandObject;

				if (exceptions.includes(commandName)) {
					continue;
				}
			}

			localCommands.push(commandObject);
		}
	}

	return localCommands;
};
