import { AtlassianCredentials, getAtlassianCredentials, fetchAtlassian } from './transport.util.js';
import { config } from './config.util.js';
import { logger } from './logger.util.js';

// Mock the config module
jest.mock('./config.util.js', () => ({
	config: {
		get: jest.fn(),
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
	// Reset all mocks before each test
	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('getAtlassianCredentials', () => {
		it('should return credentials when all environment variables are set', () => {
			// Mock the config.get function to return test values
			(config.get as jest.Mock).mockImplementation((key: string) => {
				switch (key) {
					case 'ATLASSIAN_SITE_NAME':
						return 'test-site';
					case 'ATLASSIAN_USER_EMAIL':
						return 'test@example.com';
					case 'ATLASSIAN_API_TOKEN':
						return 'test-token';
					default:
						return undefined;
				}
			});

			// Call the function
			const credentials = getAtlassianCredentials();

			// Verify the result
			expect(credentials).toEqual({
				siteName: 'test-site',
				userEmail: 'test@example.com',
				apiToken: 'test-token',
			});

			// Verify config.get was called with the correct arguments
			expect(config.get).toHaveBeenCalledWith('ATLASSIAN_SITE_NAME');
			expect(config.get).toHaveBeenCalledWith('ATLASSIAN_USER_EMAIL');
			expect(config.get).toHaveBeenCalledWith('ATLASSIAN_API_TOKEN');
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
		const mockCredentials: AtlassianCredentials = {
			siteName: 'test-site',
			userEmail: 'test@example.com',
			apiToken: 'test-token',
		};

		it('should make a request to the Atlassian API with correct parameters', async () => {
			// Mock the fetch response
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers(),
				json: jest.fn().mockResolvedValue({ data: 'test-data' }),
				text: jest.fn().mockResolvedValue('test-text'),
				clone: jest.fn().mockReturnThis(),
			};
			(global.fetch as jest.Mock).mockResolvedValue(mockResponse);

			// Call the function
			const result = await fetchAtlassian(mockCredentials, '/test-path');

			// Verify fetch was called with the correct URL and options
			expect(global.fetch).toHaveBeenCalledWith(
				'https://test-site.atlassian.net/test-path',
				expect.objectContaining({
					method: 'GET',
					headers: expect.objectContaining({
						Authorization: expect.stringContaining('Basic '),
						'Content-Type': 'application/json',
						Accept: 'application/json',
					}),
				}),
			);

			// Verify the result
			expect(result).toEqual({ data: 'test-data' });
		});

		it('should handle API errors correctly', async () => {
			// Mock the fetch response for an error
			const mockResponse = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
				headers: new Headers(),
				text: jest.fn().mockResolvedValue('Not found'),
				json: jest.fn(),
				clone: jest.fn(),
			};
			(global.fetch as jest.Mock).mockResolvedValue(mockResponse);

			// Call the function and expect it to throw
			await expect(fetchAtlassian(mockCredentials, '/test-path')).rejects.toThrow(
				'Atlassian API error: 404 Not Found',
			);

			// Verify fetch was called
			expect(global.fetch).toHaveBeenCalled();
		});

		it('should handle network errors correctly', async () => {
			// Mock fetch to throw a network error
			(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

			// Call the function and expect it to throw
			await expect(fetchAtlassian(mockCredentials, '/test-path')).rejects.toThrow(
				'Network error',
			);

			// Verify fetch was called
			expect(global.fetch).toHaveBeenCalled();
		});

		it('should normalize the path if it does not start with a slash', async () => {
			// Mock the fetch response
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers(),
				json: jest.fn().mockResolvedValue({ data: 'test-data' }),
				text: jest.fn(),
				clone: jest.fn().mockReturnThis(),
			};
			(global.fetch as jest.Mock).mockResolvedValue(mockResponse);

			// Call the function with a path that doesn't start with a slash
			await fetchAtlassian(mockCredentials, 'test-path-without-slash');

			// Verify fetch was called with the normalized path
			expect(global.fetch).toHaveBeenCalledWith(
				'https://test-site.atlassian.net/test-path-without-slash',
				expect.any(Object),
			);
		});

		it('should support custom request options', async () => {
			// Mock the fetch response
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers(),
				json: jest.fn().mockResolvedValue({ data: 'test-data' }),
				text: jest.fn(),
				clone: jest.fn().mockReturnThis(),
			};
			(global.fetch as jest.Mock).mockResolvedValue(mockResponse);

			// Custom request options
			const options = {
				method: 'POST' as const,
				headers: {
					'Custom-Header': 'custom-value',
				},
				body: { key: 'value' },
			};

			// Call the function with custom options
			await fetchAtlassian(mockCredentials, '/test-path', options);

			// Verify fetch was called with the custom options
			expect(global.fetch).toHaveBeenCalledWith(
				'https://test-site.atlassian.net/test-path',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Custom-Header': 'custom-value',
					}),
					body: JSON.stringify({ key: 'value' }),
				}),
			);
		});
	});
});
