import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';

import atlassianSpacesController from '../controllers/atlassian.spaces.controller.js';
import { SpaceStatus, SpaceType } from '../services/vendor.atlassian.spaces.types.js';

/**
 * Register Atlassian Spaces CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	logger.debug(
		`[src/cli/atlassian.spaces.cli.ts@register] Registering Atlassian Spaces CLI commands...`,
	);

	// Command to list Confluence spaces
	program
		.command('list-spaces')
		.description('List all Confluence spaces (defaults to current global spaces)')
		.option(
			'-t, --type <type>',
			'Filter spaces by type (global, personal, collaboration, knowledge_base)',
		)
		.option('-s, --status <status>', 'Filter spaces by status (current, archived)')
		.option('-l, --limit <number>', 'Limit the number of spaces returned')
		.action(async options => {
			try {
				logger.debug(
					`[src/cli/atlassian.spaces.cli.ts@list-spaces] Listing Confluence spaces...`,
					options,
				);

				// Convert options to the format expected by the controller
				const filterOptions: {
					type?: SpaceType;
					status?: SpaceStatus;
					limit?: number;
				} = {};

				if (options.type) {
					filterOptions.type = options.type as SpaceType;
				}

				if (options.status) {
					filterOptions.status = options.status as SpaceStatus;
				}

				if (options.limit) {
					filterOptions.limit = parseInt(options.limit, 10);
				}

				const result = await atlassianSpacesController.list(filterOptions);
				logger.debug(
					`[src/cli/atlassian.spaces.cli.ts@list-spaces] Spaces listed successfully`,
				);

				// Output the result to the console
				console.log(result.content);
			} catch (error) {
				logger.error(
					'[src/cli/atlassian.spaces.cli.ts@list-spaces] Failed to list spaces',
					error,
				);
				process.exit(1);
			}
		});

	// Command to get details of a specific Confluence space
	program
		.command('get-space')
		.description('Get details about a specific Confluence space')
		.argument('<spaceId>', 'ID of the space to retrieve')
		.action(async (spaceId: string) => {
			try {
				logger.debug(
					`[src/cli/atlassian.spaces.cli.ts@get-space] Fetching space details for ID: ${spaceId}...`,
				);
				const result = await atlassianSpacesController.get(spaceId);
				logger.debug(
					`[src/cli/atlassian.spaces.cli.ts@get-space] Space details fetched successfully`,
				);

				// Output the result to the console
				console.log(result.content);
			} catch (error) {
				logger.error(
					'[src/cli/atlassian.spaces.cli.ts@get-space] Failed to get space details',
					error,
				);
				process.exit(1);
			}
		});
}

export default { register };
