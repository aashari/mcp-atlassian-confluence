import { SpaceType, SpaceStatus } from '../services/vendor.atlassian.spaces.types.js';

/**
 * Options for listing Confluence spaces
 */
export interface ListSpacesOptions {
	/**
	 * Filter spaces by type (defaults to global)
	 */
	type?: SpaceType;

	/**
	 * Filter spaces by status (defaults to current)
	 */
	status?: SpaceStatus;

	/**
	 * Limit the number of spaces returned
	 */
	limit?: number;
}

/**
 * Response from controller operations
 */
export interface ControllerResponse {
	/**
	 * Formatted content to be displayed
	 */
	content: string;
}
