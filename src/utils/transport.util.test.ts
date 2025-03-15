import { getAtlassianCredentials, fetchAtlassian } from './transport.util.js';
import { config } from './config.util.js';
import { logger } from './logger.util.js';
import { SpacesResponse } from '../services/vendor.atlassian.spaces.types.js';

// Mock the config module
jest.mock('./config.util.js', () => ({
	config: {
		get: jest.fn(),
		load: jest.fn(),
	},
}));

// Mock the logger module
jest.mock('./logger.util.js', () => ({
	logger: {
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	},
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('Transport Utility', () => {
	// Load configuration before all tests
	beforeAll(() => {
		// Load configuration from all sources
		config.load();
	});

	describe('getAtlassianCredentials', () => {
		it('should return credentials when environment variables are set', () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn('Skipping test: No Atlassian credentials available');
				return;
			}

			// Verify the structure of the credentials
			expect(credentials).toHaveProperty('siteName');
			expect(credentials).toHaveProperty('userEmail');
			expect(credentials).toHaveProperty('apiToken');

			// Verify the credentials are not empty
			expect(credentials.siteName).toBeTruthy();
			expect(credentials.userEmail).toBeTruthy();
			expect(credentials.apiToken).toBeTruthy();
		});

		it('should return null and log a warning when environment variables are missing', () => {
			// Mock the config.get function to return undefined
			(config.get as jest.Mock).mockReturnValue(undefined);

			// Call the function
			const credentials = getAtlassianCredentials();

			// Verify the result is null
			expect(credentials).toBeNull();

			// Verify that a warning was logged
			expect(logger.warn).toHaveBeenCalledWith(
				'Missing Atlassian credentials. Please set ATLASSIAN_SITE_NAME, ATLASSIAN_USER_EMAIL, and ATLASSIAN_API_TOKEN environment variables.',
			);
		});
	});

	describe('fetchAtlassian', () => {
		it('should successfully fetch data from the Atlassian API', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn('Skipping test: No Atlassian credentials available');
				return;
			}

			// Make a real API call to a known endpoint
			const result = await fetchAtlassian<SpacesResponse>(
				credentials,
				'/wiki/api/v2/spaces',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result).toHaveProperty('_links');
		}, 15000); // Increase timeout for API call

		it('should handle API errors correctly', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn('Skipping test: No Atlassian credentials available');
				return;
			}

			// Make a real API call to a non-existent endpoint
			await expect(
				fetchAtlassian(credentials, '/wiki/api/v2/non-existent-endpoint'),
			).rejects.toThrow();
		}, 15000); // Increase timeout for API call

		it('should normalize paths that do not start with a slash', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn('Skipping test: No Atlassian credentials available');
				return;
			}

			// Make a real API call with a path that doesn't start with a slash
			const result = await fetchAtlassian<SpacesResponse>(credentials, 'wiki/api/v2/spaces', {
				method: 'GET',
			});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
		}, 15000); // Increase timeout for API call

		it('should support custom request options', async () => {
			// This test will be skipped if credentials are not available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				console.warn('Skipping test: No Atlassian credentials available');
				return;
			}

			// Custom request options
			const options = {
				method: 'GET' as const,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			};

			// Make a real API call with custom options
			const result = await fetchAtlassian<SpacesResponse>(
				credentials,
				'/wiki/api/v2/spaces?limit=1',
				options,
			);

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result.results.length).toBeLessThanOrEqual(1); // Verify limit parameter works
		}, 15000); // Increase timeout for API call
	});
});
