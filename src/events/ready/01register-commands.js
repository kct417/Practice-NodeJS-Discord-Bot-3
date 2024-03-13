import config from '../../../config.json' with { type: 'json' };
import getLocalCommands from '../../utils/getLocalCommands.js';
import getApplciationCommands from '../../utils/getApplciationCommands.js';
import areCommandsDifferent from '../../utils/areCommandsDifferent.js';

const { testServer } = config.testServer;

export default async (client) => {
    try {
        const localCommands = await getLocalCommands();
        const applicationCommands = await getApplciationCommands(client, testServer);
        for (const localCommand of localCommands) {
            const { name, description, options } = localCommand;
            
            const existingCommand = await applicationCommands.cache.find(
                (cmd) => cmd.name === name
            );

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`Deleted command "${name}"`);
                    continue;
                }

                if (areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, { description, options });
                    console.log(`Edited command "${name}"`);
                }
            } else {
                if (localCommand.deleted) {
                    console.log(`Skipping command "${name}"`);
                    continue;
                }

                await applicationCommands.create({
                    name,
                    description,
                    options
                });

                console.log(`Registered command "${name}"`);
            }
        }
    } catch (error) {
        console.log(`Error in register-commands.js: ${error}`);
    }
};