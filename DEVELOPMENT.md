# Development Guide

This guide provides detailed instructions for developing and extending the Boilerplate MCP Server.

## Development Environment

Run the server in development mode with hot reloading using `ts-node`:

```bash
npm run dev
```

Test the server with the MCP Inspector (a debugging tool for MCP servers):

```bash
npm run inspector
```

Both commands use the `stdio` transport by default, as defined in `src/index.ts`.

## Building

Compile the TypeScript code to JavaScript using `tsup`:

```bash
npm run build
```

This generates `dist/index.cjs` (executable CommonJS bundle) and `dist/index.d.cts` (TypeScript declarations). The `prebuild` script (`rimraf dist`) ensures a clean `dist/` folder before each build.

## Configuration System

The boilerplate includes a flexible configuration system that loads settings from multiple sources with a defined priority order:

1. **Direct Environment Variables**: Highest priority, set when running the command.
2. **.env File**: Medium priority, stored in the project root.
3. **Global Configuration File**: Lowest priority, stored at `$HOME/.mcp/configs.json`.

### Using the Configuration System

To access configuration values in your code, import the `config` utility:

```typescript
import { config } from '../utils/config.util.js';

// Get a string value
const apiToken = config.get('API_TOKEN');

// Get a boolean value
const isDebug = config.getBoolean('DEBUG');

// Get a value with a default
const timeout = config.get('API_TIMEOUT', '5000');
```

### Adding New Configuration Options

When implementing new functionality that requires configuration:

1. Document the configuration options in your code.
2. Use the `config` utility to access the values.
3. Provide sensible defaults for optional configuration.
4. Update the README.md with the new configuration options.

Example service using configuration:

```typescript
// src/services/example.service.ts
import { logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';

async function callApi() {
  const apiToken = config.get('EXAMPLE_API_TOKEN');
  const apiUrl = config.get('EXAMPLE_API_URL', 'https://api.example.com');
  
  logger.debug(`[src/services/example.service.ts@callApi] Calling API at ${apiUrl}`);
  
  // Use apiToken and apiUrl to make the API call
  // ...
}

export default { callApi };
```

## Implementing Your Own Functionality

The boilerplate includes IP address lookup functionality as an example. To add your own functionality (e.g., weather information), follow these steps:

### 1. Create Service Types

Create a new file in `src/services/` (e.g., `weather.service.type.ts`) to define the data structures for your service:

```typescript
// src/services/weather.service.type.ts
export interface WeatherData {
  location: string;
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  timestamp: string;
}
```

### 2. Create a Service

Create a new file in `src/services/` (e.g., `weather.service.ts`) to implement API calls or data processing logic:

```typescript
// src/services/weather.service.ts
import { logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';
import { WeatherData } from './weather.service.type.js';

async function get(location: string): Promise<WeatherData> {
  logger.debug(`[src/services/weather.service.ts@get] Getting weather for ${location}...`);
  
  // Get API key from configuration
  const apiKey = config.get('WEATHER_API_KEY');
  const apiUrl = config.get('WEATHER_API_URL', 'https://api.weather.com/v1');
  
  // Call a weather API here
  // For example:
  // const url = `${apiUrl}/${encodeURIComponent(location)}?key=${apiKey}`;
  // const response = await fetch(url);
  
  // Mock data for demonstration
  return {
    location,
    temperature: 22,
    conditions: 'Sunny',
    humidity: 65,
    windSpeed: 10,
    timestamp: new Date().toISOString(),
  };
}

export default { get };
```

### 3. Create a Controller

Create a new file in `src/controllers/` (e.g., `weather.controller.ts`) to implement business logic that uses your service:

```typescript
// src/controllers/weather.controller.ts
import weatherService from '../services/weather.service.js';
import { logger } from '../utils/logger.util.js';

async function get(location: string) {
  logger.debug(`[src/controllers/weather.controller.ts@get] Getting weather for ${location}...`);
  const weatherData = await weatherService.get(location);
  logger.debug(
    `[src/controllers/weather.controller.ts@get] Got the response from the service`,
    weatherData,
  );
  
  const lines: string[] = [];
  lines.push(`Location: ${weatherData.location}`);
  lines.push(`Temperature: ${weatherData.temperature}°C`);
  lines.push(`Conditions: ${weatherData.conditions}`);
  lines.push(`Humidity: ${weatherData.humidity}%`);
  lines.push(`Wind Speed: ${weatherData.windSpeed} km/h`);
  lines.push(`Updated: ${weatherData.timestamp}`);
  
  return {
    content: lines.join('\n'),
  };
}

export default { get };
```

### 4. Create Tool Types

Create a new file in `src/tools/` (e.g., `weather.type.ts`) to define Zod schema for tool arguments:

```typescript
// src/tools/weather.type.ts
import { z } from 'zod';

const WeatherToolArgs = z.object({
  location: z.string(),
});

type WeatherToolArgsType = z.infer<typeof WeatherToolArgs>;

export { WeatherToolArgs, type WeatherToolArgsType };
```

### 5. Create a Tool

Create a new file in `src/tools/` (e.g., `weather.tool.ts`) to implement the MCP tool that uses your controller:

```typescript
// src/tools/weather.tool.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { WeatherToolArgs, WeatherToolArgsType } from './weather.type.js';

import weatherController from '../controllers/weather.controller.js';

async function getWeatherInfo(args: WeatherToolArgsType, _extra: RequestHandlerExtra) {
  logger.debug(`[src/tools/weather.tool.ts@getWeatherInfo] Getting weather for ${args.location}...`);
  const message = await weatherController.get(args.location);
  logger.debug(
    `[src/tools/weather.tool.ts@getWeatherInfo] Got the response from the controller`,
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
}

function register(server: McpServer) {
  logger.debug(`[src/tools/weather.tool.ts@register] Registering tools...`);
  server.tool(
    'get-weather-info',
    'Get weather information for a specific location',
    WeatherToolArgs.shape,
    getWeatherInfo,
  );
}

export default { register };
```

### 6. Create a Resource (optional)

Create a new file in `src/resources/` (e.g., `weather.resource.ts`) to implement the MCP resource:

```typescript
// src/resources/weather.resource.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';

import weatherController from '../controllers/weather.controller.js';

/**
 * Register weather resources with the MCP server
 * @param server The MCP server instance
 */
function register(server: McpServer) {
  logger.debug(
    `[src/resources/weather.resource.ts@register] Registering weather resources...`,
  );
  server.resource(
    'Default Location Weather',
    'weather://default',
    {
      description: 'Weather information for the default location (New York)',
    },
    async (_uri, _extra) => {
      const resourceContent = await weatherController.get('New York');
      return {
        contents: [
          {
            uri: 'weather://default',
            text: resourceContent.content,
            mimeType: 'text/plain',
            description: 'Weather information for New York',
          },
        ],
      };
    },
  );
}

export default { register };
```

### 7. Create a CLI Command

Create a new file in `src/cli/` (e.g., `weather.cli.ts`) to implement the CLI command:

```typescript
// src/cli/weather.cli.ts
import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import weatherController from '../controllers/weather.controller.js';

function register(program: Command) {
  logger.debug(`[src/cli/weather.cli.ts@register] Registering weather CLI commands...`);
  
  program
    .command('get-weather-info')
    .description('Get weather information for a specific location')
    .argument('<location>', 'Location to get weather for')
    .action(async (location: string) => {
      try {
        logger.info(
          `[src/cli/weather.cli.ts@get-weather-info] Fetching weather for ${location}...`,
        );
        const result = await weatherController.get(location);
        console.log(result.content);
      } catch (error) {
        logger.error(
          '[src/cli/weather.cli.ts@get-weather-info] Failed to get weather',
          error,
        );
        process.exit(1);
      }
    });
}

export default { register };
```

## Testing Your Implementation

- Test the MCP server with the MCP Inspector: `npm run inspector`
- Test the CLI: `npm run build && node dist/index.cjs get-weather-info "New York"`
- Run your tests: `npm test`