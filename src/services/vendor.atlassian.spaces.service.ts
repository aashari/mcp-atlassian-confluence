import { logger } from '../utils/logger.util.js';
import { fetchAtlassian, getAtlassianCredentials } from '../utils/transport.util.js';
import {
	SpaceDetailed,
	SpacesResponse,
	ListSpacesParams,
	GetSpaceByIdParams,
} from './vendor.atlassian.spaces.types.js';

const API_PATH = '/wiki/api/v2';

/**
 * List spaces with optional filtering
 * @param params Optional parameters for filtering, sorting, and pagination
 * @returns Promise with spaces response
 */
async function list(params: ListSpacesParams = {}): Promise<SpacesResponse> {
	logger.debug(`[src/services/vendor.atlassian.spaces.service.ts@listSpaces] Calling the API...`);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw new Error('Atlassian credentials are required to list spaces');
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	if (params.ids?.length) {
		queryParams.set('ids', params.ids.join(','));
	}

	if (params.keys?.length) {
		queryParams.set('keys', params.keys.join(','));
	}

	if (params.type) {
		queryParams.set('type', params.type);
	}

	if (params.status) {
		queryParams.set('status', params.status);
	}

	if (params.labels?.length) {
		queryParams.set('labels', params.labels.join(','));
	}

	if (params.favoritedBy) {
		queryParams.set('favorited-by', params.favoritedBy);
	}

	if (params.notFavoritedBy) {
		queryParams.set('not-favorited-by', params.notFavoritedBy);
	}

	if (params.sort) {
		queryParams.set('sort', params.sort);
	}

	if (params.descriptionFormat) {
		queryParams.set('description-format', params.descriptionFormat);
	}

	if (params.includeIcon !== undefined) {
		queryParams.set('include-icon', params.includeIcon.toString());
	}

	if (params.cursor) {
		queryParams.set('cursor', params.cursor);
	}

	if (params.limit) {
		queryParams.set('limit', params.limit.toString());
	}

	const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
	const path = `${API_PATH}/spaces${queryString}`;

	return fetchAtlassian<SpacesResponse>(credentials, path);
}

/**
 * Get a space by ID
 * @param id Space ID
 * @param params Optional parameters for customizing the response
 * @returns Promise with space details
 */
async function get(id: string, params: GetSpaceByIdParams = {}): Promise<SpaceDetailed> {
	logger.debug(
		`[src/services/vendor.atlassian.spaces.service.ts@getSpaceById] Calling the API for space ID: ${id}`,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw new Error('Atlassian credentials are required to get space details');
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	if (params.descriptionFormat) {
		queryParams.set('description-format', params.descriptionFormat);
	}

	if (params.includeIcon !== undefined) {
		queryParams.set('include-icon', params.includeIcon.toString());
	}

	if (params.includeOperations !== undefined) {
		queryParams.set('include-operations', params.includeOperations.toString());
	}

	if (params.includeProperties !== undefined) {
		queryParams.set('include-properties', params.includeProperties.toString());
	}

	if (params.includePermissions !== undefined) {
		queryParams.set('include-permissions', params.includePermissions.toString());
	}

	if (params.includeRoleAssignments !== undefined) {
		queryParams.set('include-role-assignments', params.includeRoleAssignments.toString());
	}

	if (params.includeLabels !== undefined) {
		queryParams.set('include-labels', params.includeLabels.toString());
	}

	const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
	const path = `${API_PATH}/spaces/${id}${queryString}`;

	return fetchAtlassian<SpaceDetailed>(credentials, path);
}

export default { list, get };
