import atlassianSpacesService from '../services/vendor.atlassian.spaces.service.js';
import { logger } from '../utils/logger.util.js';
import { SpaceDetailed, SpacesResponse } from '../services/vendor.atlassian.spaces.types.js';
import { ListSpacesOptions, ControllerResponse } from './atlassian.spaces.type.js';

/**
 * List Confluence spaces
 * @param options Optional filter options
 * @returns Promise with formatted space list content
 */
async function list(options: ListSpacesOptions = {}): Promise<ControllerResponse> {
	logger.debug(
		`[src/controllers/atlassian.spaces.controller.ts@list] Listing Confluence spaces...`,
		options,
	);

	try {
		// Set default filters for status and type if not provided
		const filters = {
			type: options.type || 'global',
			status: options.status || 'current',
			limit: options.limit,
			// Hardcoded values for description format and icon inclusion
			descriptionFormat: 'view' as const,
			includeIcon: false,
		};

		logger.debug(
			`[src/controllers/atlassian.spaces.controller.ts@list] Using filters:`,
			filters,
		);

		const spacesData = await atlassianSpacesService.list(filters);
		logger.debug(
			`[src/controllers/atlassian.spaces.controller.ts@list] Got the response from the service`,
			spacesData,
		);

		// Format the spaces data for display
		const formattedSpaces = formatSpacesList(spacesData);

		return {
			content: formattedSpaces,
		};
	} catch (error) {
		logger.error(
			`[src/controllers/atlassian.spaces.controller.ts@list] Error listing spaces`,
			error,
		);
		return {
			content: `Error listing Confluence spaces: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

/**
 * Get a specific Confluence space by ID
 * @param id Space ID
 * @returns Promise with formatted space details content
 */
async function get(id: string): Promise<ControllerResponse> {
	logger.debug(
		`[src/controllers/atlassian.spaces.controller.ts@get] Getting Confluence space with ID: ${id}...`,
	);

	try {
		// Hardcoded parameters for the service call
		const params = {
			descriptionFormat: 'view' as const,
			includeIcon: false,
			includeOperations: false,
			includePermissions: false,
			includeRoleAssignments: false,
			includeLabels: true,
		};

		logger.debug(`[src/controllers/atlassian.spaces.controller.ts@get] Using params:`, params);

		const spaceData = await atlassianSpacesService.get(id, params);
		logger.debug(
			`[src/controllers/atlassian.spaces.controller.ts@get] Got the response from the service`,
			spaceData,
		);

		// Format the space data for display
		const formattedSpace = formatSpaceDetails(spaceData);

		return {
			content: formattedSpace,
		};
	} catch (error) {
		logger.error(
			`[src/controllers/atlassian.spaces.controller.ts@get] Error getting space`,
			error,
		);
		return {
			content: `Error getting Confluence space: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

/**
 * Format spaces list for display
 * @param spacesData Spaces response from the API
 * @returns Formatted string with spaces information
 */
function formatSpacesList(spacesData: SpacesResponse): string {
	if (!spacesData.results || spacesData.results.length === 0) {
		return 'No Confluence spaces found.';
	}

	const lines: string[] = ['# Confluence Spaces', ''];

	spacesData.results.forEach((space, index) => {
		// Format creation date
		const createdDate = new Date(space.createdAt).toLocaleString();

		lines.push(`## ${index + 1}. ${space.name}`);
		lines.push(`- **ID**: ${space.id}`);
		lines.push(`- **Key**: ${space.key}`);
		lines.push(`- **Type**: ${space.type}`);
		lines.push(`- **Status**: ${space.status}`);
		lines.push(`- **Created**: ${createdDate}`);
		lines.push(`- **Homepage ID**: ${space.homepageId}`);

		// Add description from view format if available
		if (space.description?.view?.value) {
			const description = space.description.view.value.trim();
			if (description) {
				lines.push(`- **Description**: ${description}`);
			}
		} else if (space.description?.plain?.value) {
			const description = space.description.plain.value.trim();
			if (description) {
				lines.push(`- **Description**: ${description}`);
			}
		}

		// Add full URL with base if available
		const baseUrl = spacesData._links.base || '';
		const spaceUrl = space._links.webui;
		const fullUrl = spaceUrl.startsWith('http') ? spaceUrl : `${baseUrl}${spaceUrl}`;
		lines.push(`- **URL**: [${space.key}](${fullUrl})`);

		// Add alias if available
		if (space.currentActiveAlias) {
			lines.push(`- **Alias**: ${space.currentActiveAlias}`);
		}

		lines.push('');
	});

	if (spacesData._links.next) {
		lines.push('---');
		lines.push('*More spaces available. Please refine your search or request the next page.*');
	}

	return lines.join('\n');
}

/**
 * Format space details for display
 * @param spaceData Space details from the API
 * @returns Formatted string with space details
 */
function formatSpaceDetails(spaceData: SpaceDetailed): string {
	// Create a full URL for the space
	const baseUrl = spaceData._links.base || '';
	const spaceUrl = spaceData._links.webui || '';
	const fullUrl = spaceUrl.startsWith('http') ? spaceUrl : `${baseUrl}${spaceUrl}`;

	// Format creation date
	const createdDate = new Date(spaceData.createdAt).toLocaleString();

	const lines: string[] = [`# Confluence Space: ${spaceData.name}`, ''];

	// Add a summary line
	lines.push(
		`> A ${spaceData.status} ${spaceData.type} space with key \`${spaceData.key}\` created on ${createdDate}.`,
	);
	lines.push('');

	lines.push(`## Basic Information`);
	lines.push(`- **ID**: ${spaceData.id}`);
	lines.push(`- **Key**: ${spaceData.key}`);
	lines.push(`- **Type**: ${spaceData.type}`);
	lines.push(`- **Status**: ${spaceData.status}`);
	lines.push(`- **Created At**: ${createdDate}`);
	lines.push(`- **Author ID**: ${spaceData.authorId}`);
	lines.push(`- **Homepage ID**: ${spaceData.homepageId}`);

	// Add alias if available
	if (spaceData.currentActiveAlias) {
		lines.push(`- **Current Alias**: ${spaceData.currentActiveAlias}`);
	}

	// Add description section if available
	if (spaceData.description?.view?.value || spaceData.description?.plain?.value) {
		lines.push('');
		lines.push(`## Description`);

		const viewValue = spaceData.description?.view?.value;
		const plainValue = spaceData.description?.plain?.value;

		if (viewValue && viewValue.trim()) {
			lines.push(viewValue.trim());
		} else if (plainValue && plainValue.trim()) {
			lines.push(plainValue.trim());
		} else {
			lines.push('*No description provided*');
		}
	}

	lines.push('');
	lines.push(`## Links`);
	lines.push(`- **Web UI**: [Open in Confluence](${fullUrl})`);

	// Add labels section
	if (spaceData.labels && spaceData.labels.results) {
		lines.push('');
		lines.push(`## Labels`);

		if (spaceData.labels.results.length === 0) {
			lines.push('*No labels assigned to this space*');
		} else {
			lines.push('This space has the following labels:');
			lines.push('');

			spaceData.labels.results.forEach(label => {
				const prefix = label.prefix ? `${label.prefix}:` : '';
				lines.push(`- **${prefix}${label.name}** (ID: ${label.id})`);
			});

			// Add note about more labels if applicable
			if (spaceData.labels.meta?.hasMore) {
				lines.push('');
				lines.push('*More labels are available but not shown*');
			}
		}
	}

	// Add a footer with helpful information
	lines.push('');
	lines.push('---');
	lines.push(`*Space information retrieved at ${new Date().toLocaleString()}*`);
	lines.push(`*To view this space in Confluence, visit: ${fullUrl}*`);

	return lines.join('\n');
}

export default { list, get };
