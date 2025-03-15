# Development Guide for MCP Atlassian Confluence

This guide provides detailed instructions for developing and extending the MCP Atlassian Confluence server.

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

The project includes a flexible configuration system that loads settings from multiple sources with a defined priority order:

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

### Atlassian Confluence Configuration

For Atlassian Confluence integration, the following configuration options are required:

- `ATLASSIAN_SITE_NAME`: Your Atlassian site name (e.g., for `https://example.atlassian.net`, use `example`).
- `ATLASSIAN_USER_EMAIL`: Email address associated with your Atlassian account.
- `ATLASSIAN_API_TOKEN`: API token for Atlassian API access.

You can create an API token from your Atlassian account at: https://id.atlassian.com/manage-profile/security/api-tokens

## Atlassian API Integration

The project includes utilities for interacting with the Atlassian Confluence API.

### Transport Utility

The `transport.util.ts` file provides functions for making authenticated requests to the Atlassian API:

```typescript
import { fetchAtlassian, getAtlassianCredentials } from '../utils/transport.util.js';

// Get credentials
const credentials = getAtlassianCredentials();
if (!credentials) {
  throw new Error('Atlassian credentials are required');
}

// Make an API call
const data = await fetchAtlassian(credentials, '/wiki/api/v2/spaces');
```

### Error Handling

All API calls should include proper error handling:

```typescript
try {
  const result = await fetchAtlassian(credentials, '/wiki/api/v2/spaces');
  // Process result
} catch (error) {
  logger.error('Failed to fetch spaces', error);
  // Handle error appropriately
}
```

## Implementing New Confluence Features

The project currently implements Confluence Spaces functionality. To add more Confluence features (e.g., pages, content, comments), follow these steps:

### 1. Create Service Types

Create a new file in `src/services/` (e.g., `vendor.atlassian.pages.types.ts`) to define the data structures:

```typescript
// src/services/vendor.atlassian.pages.types.ts
export interface Page {
  id: string;
  title: string;
  spaceId: string;
  status: string;
  // Other properties
}

export interface PagesResponse {
  results: Page[];
  _links: {
    next?: string;
    // Other links
  };
}

export interface PageDetailed extends Page {
  // Additional detailed properties
}

export interface ListPagesParams {
  spaceId?: string;
  status?: string;
  title?: string;
  // Other filter parameters
}

export interface GetPageByIdParams {
  // Optional parameters
}
```

### 2. Create a Service

Create a new file in `src/services/` (e.g., `vendor.atlassian.pages.service.ts`) to implement API calls:

```typescript
// src/services/vendor.atlassian.pages.service.ts
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
  
  if (params.spaceId) {
    queryParams.set('space-id', params.spaceId);
  }
  
  if (params.status) {
    queryParams.set('status', params.status);
  }
  
  if (params.title) {
    queryParams.set('title', params.title);
  }
  
  // Add other parameters as needed
  
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
  
  // Add parameters as needed
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const path = `${API_PATH}/pages/${id}${queryString}`;

  return fetchAtlassian<PageDetailed>(credentials, path);
}

export default { list, get };
```

### 3. Create a Controller

Create a new file in `src/controllers/` (e.g., `atlassian.pages.controller.ts`) to implement business logic:

```typescript
// src/controllers/atlassian.pages.controller.ts
import atlassianPagesService from '../services/vendor.atlassian.pages.service.js';
import { logger } from '../utils/logger.util.js';
import { PageDetailed, PagesResponse } from '../services/vendor.atlassian.pages.types.js';

/**
 * List Confluence pages
 * @param spaceId Optional space ID to filter pages
 * @returns Promise with formatted page list content
 */
async function list(spaceId?: string) {
  logger.debug(
    `[src/controllers/atlassian.pages.controller.ts@list] Listing Confluence pages...`,
  );

  try {
    const pagesData = await atlassianPagesService.list({ spaceId });
    logger.debug(
      `[src/controllers/atlassian.pages.controller.ts@list] Got the response from the service`,
      pagesData,
    );

    // Format the pages data for display
    const formattedPages = formatPagesList(pagesData);

    return {
      content: formattedPages,
    };
  } catch (error) {
    logger.error(
      `[src/controllers/atlassian.pages.controller.ts@list] Error listing pages`,
      error,
    );
    return {
      content: `Error listing Confluence pages: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get a specific Confluence page by ID
 * @param id Page ID
 * @returns Promise with formatted page details content
 */
async function get(id: string) {
  logger.debug(
    `[src/controllers/atlassian.pages.controller.ts@get] Getting Confluence page with ID: ${id}...`,
  );

  try {
    const pageData = await atlassianPagesService.get(id);
    logger.debug(
      `[src/controllers/atlassian.pages.controller.ts@get] Got the response from the service`,
      pageData,
    );

    // Format the page data for display
    const formattedPage = formatPageDetails(pageData);

    return {
      content: formattedPage,
    };
  } catch (error) {
    logger.error(
      `[src/controllers/atlassian.pages.controller.ts@get] Error getting page`,
      error,
    );
    return {
      content: `Error getting Confluence page: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Format pages list for display
 * @param pagesData Pages response from the API
 * @returns Formatted string with pages information
 */
function formatPagesList(pagesData: PagesResponse): string {
  if (!pagesData.results || pagesData.results.length === 0) {
    return 'No Confluence pages found.';
  }

  const lines: string[] = ['# Confluence Pages', ''];

  pagesData.results.forEach((page, index) => {
    lines.push(`## ${index + 1}. ${page.title}`);
    lines.push(`- ID: ${page.id}`);
    lines.push(`- Space ID: ${page.spaceId}`);
    lines.push(`- Status: ${page.status}`);
    // Add other relevant properties
    lines.push('');
  });

  if (pagesData._links.next) {
    lines.push('*More pages available. Please refine your search or request the next page.*');
  }

  return lines.join('\n');
}

/**
 * Format page details for display
 * @param pageData Page details from the API
 * @returns Formatted string with page details
 */
function formatPageDetails(pageData: PageDetailed): string {
  const lines: string[] = [`# Confluence Page: ${pageData.title}`, ''];

  lines.push(`## Basic Information`);
  lines.push(`- ID: ${pageData.id}`);
  lines.push(`- Space ID: ${pageData.spaceId}`);
  lines.push(`- Status: ${pageData.status}`);
  // Add other relevant properties

  // Add content sections as needed

  return lines.join('\n');
}

export default { list, get };
```

### 4. Create Tool Types

Create a new file in `src/tools/` (e.g., `atlassian.pages.type.ts`) to define Zod schema for tool arguments:

```typescript
// src/tools/atlassian.pages.type.ts
import { z } from 'zod';

const ListPagesToolArgs = z.object({
  spaceId: z.string().optional(),
});

type ListPagesToolArgsType = z.infer<typeof ListPagesToolArgs>;

const GetPageToolArgs = z.object({
  id: z.string(),
});

type GetPageToolArgsType = z.infer<typeof GetPageToolArgs>;

export {
  ListPagesToolArgs,
  type ListPagesToolArgsType,
  GetPageToolArgs,
  type GetPageToolArgsType,
};
```

### 5. Create a Tool

Create a new file in `src/tools/` (e.g., `atlassian.pages.tool.ts`) to implement the MCP tool:

```typescript
// src/tools/atlassian.pages.tool.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import {
  ListPagesToolArgs,
  ListPagesToolArgsType,
  GetPageToolArgs,
  GetPageToolArgsType,
} from './atlassian.pages.type.js';

import atlassianPagesController from '../controllers/atlassian.pages.controller.js';

/**
 * List Confluence pages
 * @param args Tool arguments (optional space ID)
 * @param _extra Extra request handler information
 * @returns MCP response with formatted pages list
 */
async function listPages(args: ListPagesToolArgsType, _extra: RequestHandlerExtra) {
  logger.debug(`[src/tools/atlassian.pages.tool.ts@listPages] Listing Confluence pages...`);

  try {
    const message = await atlassianPagesController.list(args.spaceId);
    logger.debug(
      `[src/tools/atlassian.pages.tool.ts@listPages] Got the response from the controller`,
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
    logger.error(`[src/tools/atlassian.pages.tool.ts@listPages] Error listing pages`, error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error listing Confluence pages: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Get details of a specific Confluence page
 * @param args Tool arguments containing the page ID
 * @param _extra Extra request handler information
 * @returns MCP response with formatted page details
 */
async function getPage(args: GetPageToolArgsType, _extra: RequestHandlerExtra) {
  logger.debug(
    `[src/tools/atlassian.pages.tool.ts@getPage] Getting page details for ID: ${args.id}...`,
  );

  try {
    const message = await atlassianPagesController.get(args.id);
    logger.debug(
      `[src/tools/atlassian.pages.tool.ts@getPage] Got the response from the controller`,
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
      `[src/tools/atlassian.pages.tool.ts@getPage] Error getting page details`,
      error,
    );
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error getting Confluence page details: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Register Atlassian Pages tools with the MCP server
 * @param server The MCP server instance
 */
function register(server: McpServer) {
  logger.debug(
    `[src/tools/atlassian.pages.tool.ts@register] Registering Atlassian Pages tools...`,
  );

  // Register the list pages tool
  server.tool(
    'list-pages',
    'List Confluence pages, optionally filtered by space',
    ListPagesToolArgs.shape,
    listPages,
  );

  // Register the get page details tool
  server.tool(
    'get-page',
    'Get details about a specific Confluence page',
    GetPageToolArgs.shape,
    getPage,
  );
}

export default { register };
```

### 6. Create a CLI Command

Create a new file in `src/cli/` (e.g., `atlassian.pages.cli.ts`) to implement the CLI command:

```typescript
// src/cli/atlassian.pages.cli.ts
import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';

import atlassianPagesController from '../controllers/atlassian.pages.controller.js';

/**
 * Register Atlassian Pages CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
  logger.debug(
    `[src/cli/atlassian.pages.cli.ts@register] Registering Atlassian Pages CLI commands...`,
  );

  // Command to list Confluence pages
  program
    .command('list-pages')
    .description('List Confluence pages, optionally filtered by space')
    .option('-s, --space-id <spaceId>', 'Filter pages by space ID')
    .action(async (options) => {
      try {
        logger.debug(
          `[src/cli/atlassian.pages.cli.ts@list-pages] Listing Confluence pages...`,
          options,
        );
        const result = await atlassianPagesController.list(options.spaceId);
        logger.debug(
          `[src/cli/atlassian.pages.cli.ts@list-pages] Pages listed successfully`,
        );

        // Output the result to the console
        console.log(result.content);
      } catch (error) {
        logger.error(
          '[src/cli/atlassian.pages.cli.ts@list-pages] Failed to list pages',
          error,
        );
        process.exit(1);
      }
    });

  // Command to get details of a specific Confluence page
  program
    .command('get-page')
    .description('Get details about a specific Confluence page')
    .argument('<pageId>', 'ID of the page to retrieve')
    .action(async (pageId: string) => {
      try {
        logger.debug(
          `[src/cli/atlassian.pages.cli.ts@get-page] Fetching page details for ID: ${pageId}...`,
        );
        const result = await atlassianPagesController.get(pageId);
        logger.debug(
          `[src/cli/atlassian.pages.cli.ts@get-page] Page details fetched successfully`,
        );

        // Output the result to the console
        console.log(result.content);
      } catch (error) {
        logger.error(
          '[src/cli/atlassian.pages.cli.ts@get-page] Failed to get page details',
          error,
        );
        process.exit(1);
      }
    });
}

export default { register };
```

### 7. Register the New Tools and CLI Commands

Update `src/index.ts` to register the new tools:

```typescript
// Import the new tools
import atlassianPagesTools from './tools/atlassian.pages.tool.js';

// In the startServer function, register the tools
atlassianPagesTools.register(serverInstance);
```

Update `src/cli/index.ts` to register the new CLI commands:

```typescript
// Import the new CLI commands
import atlassianPagesCli from './atlassian.pages.cli.js';

// In the runCli function, register the CLI commands
atlassianPagesCli.register(program);
```

## Testing Your Implementation

- Test the MCP server with the MCP Inspector: `npm run inspector`
- Test the CLI: `npm run build && node dist/index.cjs list-pages --space-id 123456`
- Run your tests: `npm test`

## Best Practices

### Logging

Use the logger utility for consistent logging:

```typescript
import { logger } from '../utils/logger.util.js';

// Debug level for development information
logger.debug('Detailed information for debugging');

// Info level for operational messages
logger.info('Normal operational information');

// Warning level for potential issues
logger.warn('Warning about potential problems');

// Error level for failures
logger.error('Error information', error);
```

### Error Handling

Always include proper error handling in your code:

```typescript
try {
  // Code that might throw an error
} catch (error) {
  logger.error('Error description', error);
  // Return a user-friendly error message
  return {
    content: `Error message: ${error instanceof Error ? error.message : String(error)}`,
  };
}
```

### Code Organization

Follow the established architecture pattern:

- **Services**: API calls and data retrieval
- **Controllers**: Business logic and data formatting
- **Tools**: MCP tool definitions and handlers
- **CLI**: Command-line interface commands
- **Utils**: Shared utilities

### Documentation

Document your code with JSDoc comments:

```typescript
/**
 * Brief description of what the function does
 * @param paramName Description of the parameter
 * @returns Description of the return value
 */
function myFunction(paramName: string): string {
  // Implementation
}
```