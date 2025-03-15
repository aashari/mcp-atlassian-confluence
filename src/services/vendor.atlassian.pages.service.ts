import { logger } from '../utils/logger.util.js';
import { fetchAtlassian, getAtlassianCredentials } from '../utils/transport.util.js';
import {
	PageDetailed,
	PagesResponse,
	ListPagesParams,
	GetPageByIdParams,
} from './vendor.atlassian.pages.types.js';

const API_PATH = '/wiki/api/v2';

/**
 * List pages with optional filtering
 * @param params Optional parameters for filtering, sorting, and pagination
 * @returns Promise with pages response
 */
async function list(params: ListPagesParams = {}): Promise<PagesResponse> {
	logger.debug(`[src/services/vendor.atlassian.pages.service.ts@listPages] Calling the API...`);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw new Error('Atlassian credentials are required to list pages');
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	if (params.id?.length) {
		queryParams.set('id', params.id.join(','));
	}

	if (params.spaceId?.length) {
		queryParams.set('space-id', params.spaceId.join(','));
	}

	if (params.parentId) {
		queryParams.set('parent-id', params.parentId);
	}

	if (params.sort) {
		queryParams.set('sort', params.sort);
	}

	if (params.status?.length) {
		queryParams.set('status', params.status.join(','));
	}

	if (params.title) {
		queryParams.set('title', params.title);
	}

	if (params.bodyFormat) {
		queryParams.set('body-format', params.bodyFormat);
	}

	if (params.cursor) {
		queryParams.set('cursor', params.cursor);
	}

	if (params.limit) {
		queryParams.set('limit', params.limit.toString());
	}

	const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
	const path = `${API_PATH}/pages${queryString}`;

	return fetchAtlassian<PagesResponse>(credentials, path);
}

/**
 * Get a page by ID
 * @param id Page ID
 * @param params Optional parameters for customizing the response
 * @returns Promise with page details
 */
async function get(id: string, params: GetPageByIdParams = {}): Promise<PageDetailed> {
	logger.debug(
		`[src/services/vendor.atlassian.pages.service.ts@getPageById] Calling the API for page ID: ${id}`,
	);

	const credentials = getAtlassianCredentials();
	if (!credentials) {
		throw new Error('Atlassian credentials are required to get page details');
	}

	// Build query parameters
	const queryParams = new URLSearchParams();

	if (params.bodyFormat) {
		queryParams.set('body-format', params.bodyFormat);
	}

	if (params.getDraft !== undefined) {
		queryParams.set('get-draft', params.getDraft.toString());
	}

	if (params.status?.length) {
		queryParams.set('status', params.status.join(','));
	}

	if (params.version !== undefined) {
		queryParams.set('version', params.version.toString());
	}

	if (params.includeLabels !== undefined) {
		queryParams.set('include-labels', params.includeLabels.toString());
	}

	if (params.includeProperties !== undefined) {
		queryParams.set('include-properties', params.includeProperties.toString());
	}

	if (params.includeOperations !== undefined) {
		queryParams.set('include-operations', params.includeOperations.toString());
	}

	if (params.includeLikes !== undefined) {
		queryParams.set('include-likes', params.includeLikes.toString());
	}

	if (params.includeVersions !== undefined) {
		queryParams.set('include-versions', params.includeVersions.toString());
	}

	if (params.includeVersion !== undefined) {
		queryParams.set('include-version', params.includeVersion.toString());
	}

	if (params.includeFavoritedByCurrentUserStatus !== undefined) {
		queryParams.set(
			'include-favorited-by-current-user-status',
			params.includeFavoritedByCurrentUserStatus.toString(),
		);
	}

	if (params.includeWebresources !== undefined) {
		queryParams.set('include-webresources', params.includeWebresources.toString());
	}

	if (params.includeCollaborators !== undefined) {
		queryParams.set('include-collaborators', params.includeCollaborators.toString());
	}

	const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
	const path = `${API_PATH}/pages/${id}${queryString}`;

	return fetchAtlassian<PageDetailed>(credentials, path);
}

export default { list, get };
