import { logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';
import { IPDetail } from './vendor.ip-api.com.type.js';

const ENDPOINT = 'http://ip-api.com/json';

async function get(ipAddress?: string): Promise<IPDetail> {
	logger.debug(`[src/services/vendor.ip-api.com.ts@get] Calling the API...`);

	// Get API token from configuration
	const apiToken = config.get('IPAPI_API_TOKEN');

	// Build URL with token if available
	let url = `${ENDPOINT}/${ipAddress ?? ''}`;
	if (apiToken) {
		url += `?key=${apiToken}`;
		logger.debug(`[src/services/vendor.ip-api.com.ts@get] Using API token`);
	}

	const response = await fetch(url);
	return response.json() as Promise<IPDetail>;
}

export default { get };
