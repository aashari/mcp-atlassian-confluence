import atlassianSpacesService from '../services/vendor.atlassian.spaces.service.js';
import { logger } from '../utils/logger.util.js';
import { SpaceDetailed, SpacesResponse } from '../services/vendor.atlassian.spaces.types.js';

/**
 * List Confluence spaces
 * @returns Promise with formatted space list content
 */
async function list() {
	logger.debug(
		`[src/controllers/atlassian.spaces.controller.ts@list] Listing Confluence spaces...`,
	);

	try {
		const spacesData = await atlassianSpacesService.list();
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
async function get(id: string) {
	logger.debug(
		`[src/controllers/atlassian.spaces.controller.ts@get] Getting Confluence space with ID: ${id}...`,
	);

	try {
		const spaceData = await atlassianSpacesService.get(id);
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
		lines.push(`## ${index + 1}. ${space.name}`);
		lines.push(`- ID: ${space.id}`);
		lines.push(`- Key: ${space.key}`);
		lines.push(`- Type: ${space.type}`);
		lines.push(`- Status: ${space.status}`);

		if (space.description?.plain?.value) {
			lines.push(`- Description: ${space.description.plain.value}`);
		}

		lines.push(`- URL: ${space._links.webui}`);
		lines.push('');
	});

	if (spacesData._links.next) {
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
	const lines: string[] = [`# Confluence Space: ${spaceData.name}`, ''];

	lines.push(`## Basic Information`);
	lines.push(`- ID: ${spaceData.id}`);
	lines.push(`- Key: ${spaceData.key}`);
	lines.push(`- Type: ${spaceData.type}`);
	lines.push(`- Status: ${spaceData.status}`);
	lines.push(`- Created At: ${new Date(spaceData.createdAt).toLocaleString()}`);
	lines.push(`- Author ID: ${spaceData.authorId}`);
	lines.push(`- Homepage ID: ${spaceData.homepageId}`);

	if (spaceData.description?.plain?.value) {
		lines.push('');
		lines.push(`## Description`);
		lines.push(spaceData.description.plain.value);
	}

	lines.push('');
	lines.push(`## Links`);
	lines.push(`- Web UI: ${spaceData._links.webui}`);

	if (spaceData.labels && spaceData.labels.results.length > 0) {
		lines.push('');
		lines.push(`## Labels`);
		spaceData.labels.results.forEach(label => {
			lines.push(`- ${label.name}`);
		});
	}

	return lines.join('\n');
}

export default { list, get };
