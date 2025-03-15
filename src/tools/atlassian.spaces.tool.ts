import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import {
	ListSpacesToolArgs,
	ListSpacesToolArgsType,
	GetSpaceToolArgs,
	GetSpaceToolArgsType,
} from './atlassian.spaces.type.js';

import atlassianSpacesController from '../controllers/atlassian.spaces.controller.js';

/**
 * List Confluence spaces
 * @param args Tool arguments (currently empty as the controller takes no parameters)
 * @param _extra Extra request handler information
 * @returns MCP response with formatted spaces list
 */
async function listSpaces(_args: ListSpacesToolArgsType, _extra: RequestHandlerExtra) {
	logger.debug(`[src/tools/atlassian.spaces.tool.ts@listSpaces] Listing Confluence spaces...`);

	try {
		const message = await atlassianSpacesController.list();
		logger.debug(
			`[src/tools/atlassian.spaces.tool.ts@listSpaces] Got the response from the controller`,
			message,
		);

		return {
			content: [
				{
					type: 'text' as const,
					text: message.content,
				},
			],
		};
	} catch (error) {
		logger.error(`[src/tools/atlassian.spaces.tool.ts@listSpaces] Error listing spaces`, error);
		return {
			content: [
				{
					type: 'text' as const,
					text: `Error listing Confluence spaces: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
		};
	}
}

/**
 * Get details of a specific Confluence space
 * @param args Tool arguments containing the space ID
 * @param _extra Extra request handler information
 * @returns MCP response with formatted space details
 */
async function getSpace(args: GetSpaceToolArgsType, _extra: RequestHandlerExtra) {
	logger.debug(
		`[src/tools/atlassian.spaces.tool.ts@getSpace] Getting space details for ID: ${args.id}...`,
	);

	try {
		const message = await atlassianSpacesController.get(args.id);
		logger.debug(
			`[src/tools/atlassian.spaces.tool.ts@getSpace] Got the response from the controller`,
			message,
		);

		return {
			content: [
				{
					type: 'text' as const,
					text: message.content,
				},
			],
		};
	} catch (error) {
		logger.error(
			`[src/tools/atlassian.spaces.tool.ts@getSpace] Error getting space details`,
			error,
		);
		return {
			content: [
				{
					type: 'text' as const,
					text: `Error getting Confluence space details: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
		};
	}
}

/**
 * Register Atlassian Spaces tools with the MCP server
 * @param server The MCP server instance
 */
function register(server: McpServer) {
	logger.debug(
		`[src/tools/atlassian.spaces.tool.ts@register] Registering Atlassian Spaces tools...`,
	);

	// Register the list spaces tool
	server.tool(
		'list-spaces',
		'List all available Confluence spaces',
		ListSpacesToolArgs.shape,
		listSpaces,
	);

	// Register the get space details tool
	server.tool(
		'get-space',
		'Get details about a specific Confluence space',
		GetSpaceToolArgs.shape,
		getSpace,
	);
}

export default { register };
