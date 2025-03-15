import { logger } from './logger.util.js';

/**
 * Interface for Atlassian API credentials
 */
export interface AtlassianCredentials {
	baseUrl: string;
	username: string;
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
	const { baseUrl, username, apiToken } = credentials;

	// Ensure path starts with a slash
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	// Construct the full URL
	const url = `${baseUrl}${normalizedPath}`;

	// Set up authentication and headers
	const headers = {
		Authorization: `Basic ${Buffer.from(`${username}:${apiToken}`).toString('base64')}`,
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
