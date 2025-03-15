import { logger } from './logger.util.js';
import { config } from './config.util.js';

/**
 * Interface for Atlassian API credentials
 */
export interface AtlassianCredentials {
	siteName: string;
	userEmail: string;
	apiToken: string;
}

/**
 * Interface for HTTP request options
 */
export interface RequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers?: Record<string, string>;
	body?: unknown;
}

/**
 * Get Atlassian credentials from environment variables
 * @returns AtlassianCredentials object or null if credentials are missing
 */
export function getAtlassianCredentials(): AtlassianCredentials | null {
	const siteName = config.get('ATLASSIAN_SITE_NAME');
	const userEmail = config.get('ATLASSIAN_USER_EMAIL');
	const apiToken = config.get('ATLASSIAN_API_TOKEN');

	if (!siteName || !userEmail || !apiToken) {
		logger.warn(
			'Missing Atlassian credentials. Please set ATLASSIAN_SITE_NAME, ATLASSIAN_USER_EMAIL, and ATLASSIAN_API_TOKEN environment variables.',
		);
		return null;
	}

	return {
		siteName,
		userEmail,
		apiToken,
	};
}

/**
 * Fetch data from Atlassian API
 * @param credentials Atlassian API credentials
 * @param path API endpoint path (without base URL)
 * @param options Request options
 * @returns Response data
 */
export async function fetchAtlassian<T>(
	credentials: AtlassianCredentials,
	path: string,
	options: RequestOptions = {},
): Promise<T> {
	const { siteName, userEmail, apiToken } = credentials;

	// Ensure path starts with a slash
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	// Construct the full URL
	const baseUrl = `https://${siteName}.atlassian.net`;
	const url = `${baseUrl}${normalizedPath}`;

	// Set up authentication and headers
	const headers = {
		Authorization: `Basic ${Buffer.from(`${userEmail}:${apiToken}`).toString('base64')}`,
		'Content-Type': 'application/json',
		Accept: 'application/json',
		...options.headers,
	};

	// Prepare request options
	const requestOptions: RequestInit = {
		method: options.method || 'GET',
		headers,
		body: options.body ? JSON.stringify(options.body) : undefined,
	};

	logger.debug(`[src/utils/transport.util.ts@fetchAtlassian] Calling Atlassian API: ${url}`);

	try {
		const response = await fetch(url, requestOptions);

		// Log the raw response status and headers
		logger.debug(
			`[src/utils/transport.util.ts@fetchAtlassian] Raw response received: ${response.status} ${response.statusText}`,
			{
				url,
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			logger.error(
				`[src/utils/transport.util.ts@fetchAtlassian] API error: ${response.status} ${response.statusText}`,
				errorText,
			);
			throw new Error(`Atlassian API error: ${response.status} ${response.statusText}`);
		}

		// Clone the response to log its content without consuming it
		const clonedResponse = response.clone();
		const responseJson = await clonedResponse.json();
		logger.debug(`[src/utils/transport.util.ts@fetchAtlassian] Response body:`, responseJson);

		return response.json() as Promise<T>;
	} catch (error) {
		logger.error(`[src/utils/transport.util.ts@fetchAtlassian] Request failed`, error);
		throw error;
	}
}
