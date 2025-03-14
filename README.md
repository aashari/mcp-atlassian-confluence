# MCP Atlassian Confluence Server

A Model Context Protocol (MCP) server for Atlassian Confluence integration. This project allows AI assistants like Claude Desktop and Cursor AI to access and interact with Atlassian Confluence content through the Model Context Protocol.

> **Note**: This project is forked from [boilerplate-mcp-server](https://github.com/aashari/boilerplate-mcp-server), a template for building MCP servers. It maintains compatibility with the boilerplate while adding Confluence-specific functionality.

## About MCP

For detailed information about the Model Context Protocol (MCP), including core concepts, architecture, and implementation guides, please refer to the [official MCP documentation](https://modelcontextprotocol.io/docs/).

## Core Features

This MCP server provides the following capabilities:

### Atlassian Confluence Integration

- **Spaces Management**:
  - `list-spaces`: List all available Confluence spaces with their IDs, keys, types, and URLs (defaults to current global spaces)
  - `get-space`: Get detailed information about a specific Confluence space by ID, including labels and other metadata

## Running with npx

Run the server without local installation:

```bash
npx -y aashari/mcp-atlassian-confluence
```

This command fetches the package directly from GitHub, runs `npm run build` (via `prepare` script), and executes the server. The `-y` flag skips prompts for a seamless experience.

## Using as a CLI Tool

The package can also be used as a command-line tool for human interaction:

- **Get help and available commands**:
  ```bash
  npx -y aashari/mcp-atlassian-confluence --help
  ```
  
  Example output:
  ```
  Usage: @aashari/mcp-atlassian-confluence [options] [command]

  A Model Context Protocol (MCP) server for Atlassian Confluence integration

  Options:
    -V, --version               output the version number
    -h, --help                  display help for command

  Commands:
    list-spaces [options]       List Confluence spaces, optionally filtered by type and status
    get-space <spaceId>         Get details about a specific Confluence space
    help [command]              display help for command
  ```

- **List Confluence spaces**:
  ```bash
  npx -y aashari/mcp-atlassian-confluence list-spaces
  ```
  
  Example output:
  ```
  # Confluence Spaces

  ## 1. Example Space A
  - **ID**: 123456
  - **Key**: EXMPL
  - **Type**: global
  - **Status**: current
  - **Created**: 1/1/2023, 12:00:00 PM
  - **Homepage ID**: 123789
  - **Description**: Example Confluence space for demonstration purposes
  - **URL**: [EXMPL](https://example.atlassian.net/wiki/spaces/EXMPL)
  - **Alias**: EXMPL

  ## 2. Example Space B
  - **ID**: 789012
  - **Key**: DEMO
  - **Type**: global
  - **Status**: current
  - **Created**: 2/1/2023, 10:00:00 AM
  - **Homepage ID**: 789123
  - **URL**: [DEMO](https://example.atlassian.net/wiki/spaces/DEMO)
  - **Alias**: DEMO

  ...
  ```

- **Get details for a specific Confluence space**:
  ```bash
  npx -y aashari/mcp-atlassian-confluence get-space 32702468
  ```
  
  Example output:
  ```
  # Confluence Space: Example Space C

  > A current global space with key `DOCS` created on 3/15/2023, 10:00:00 AM.

  ## Basic Information
  - **ID**: 345678
  - **Key**: DOCS
  - **Type**: global
  - **Status**: current
  - **Created At**: 3/15/2023, 10:00:00 AM
  - **Author ID**: 123456:abcd1234-abcd-1234-abcd-1234abcd1234
  - **Homepage ID**: 345789
  - **Current Alias**: DOCS

  ## Links
  - **Web UI**: [Open in Confluence](https://example.atlassian.net/wiki/spaces/DOCS)

  ## Labels

  This space has the following labels:
  - documentation
  - example
  - reference

  *Space information retrieved at 3/16/2025, 1:31:45 AM*
  *To view this space in Confluence, visit: https://example.atlassian.net/wiki/spaces/DOCS*
  ```

When run without arguments, the package starts the MCP Server for AI clients:
```bash
npx -y aashari/mcp-atlassian-confluence
```

This will start the MCP server in STDIO mode, ready to communicate with AI clients like Claude Desktop.

## Setting Up with Claude Desktop

To use this MCP server with Claude Desktop:

1. **Open Claude Desktop Settings**:
   - Launch Claude Desktop
   - Click on the settings icon (gear) in the top-right corner
   
   ![Claude Desktop Settings](public/claude-setup-01.png)

2. **Edit MCP Configuration**:
   - Click on "Edit Config" button
   - This will open File Explorer/Finder with the `claude_desktop_config.json` file

3. **Update Configuration File**:
   - Add the following configuration to the file:
   ```json
   {
     "mcpServers": {
       "aashari/mcp-atlassian-confluence": {
         "command": "npx",
         "args": ["-y", "aashari/mcp-atlassian-confluence"]
       }
     }
   }
   ```
   - Save the file

   To pass configuration options to the server, you can modify the args array:
   ```json
   {
     "mcpServers": {
       "aashari/mcp-atlassian-confluence": {
         "command": "npx",
         "args": ["-y", "DEBUG=true", "ATLASSIAN_SITE_NAME=your_site_name", "ATLASSIAN_USER_EMAIL=your_email", "ATLASSIAN_API_TOKEN=your_token", "aashari/mcp-atlassian-confluence"]
       }
     }
   }
   ```

4. **Restart Claude Desktop**:
   - Close and reopen Claude Desktop to apply the changes
   
   ![Claude Desktop Home](public/claude-setup-02.png)

5. **Verify Tool Availability**:
   - On the Claude home page, look for the hammer icon on the right side
   - Click it to see available tools
   - Ensure the tools are listed
   
   ![Claude Tools Menu](public/claude-setup-03.png)

6. **Test the Tool**:
   - Try asking Claude to use one of the available tools
   - For example: "List all Confluence spaces" or "Get details about Confluence space with ID 123456"
   - Claude will use the MCP tool to fetch and display the requested information

## Setting Up with Cursor AI

To use this MCP server with Cursor AI:

1. **Open Cursor Settings**:
   - Launch Cursor
   - Press `CMD + SHIFT + P` (or `CTRL + SHIFT + P` on Windows)
   - Type "settings" and select "Cursor Settings"
   - On the sidebar, select "MCP"
   
   ![Cursor Settings MCP](public/cursor-setup-01.png)

2. **Add New MCP Server**:
   - Click "+ Add new MCP server"
   - A configuration form will appear
   
   ![Cursor Add MCP Server](public/cursor-setup-02.png)

3. **Configure MCP Server**:
   - **Name**: Enter `aashari/mcp-atlassian-confluence`
   - **Type**: Select `command` from the dropdown
   - **Command**: Enter `npx -y aashari/mcp-atlassian-confluence`
   
   To pass configuration options, you can modify the command:
   ```
   DEBUG=true ATLASSIAN_SITE_NAME=your_site_name ATLASSIAN_USER_EMAIL=your_email ATLASSIAN_API_TOKEN=your_token npx -y aashari/mcp-atlassian-confluence
   ```
   
   - Click "Add"

4. **Verify Server Configuration**:
   - The server should now be listed with a green indicator
   - You should see the available tools listed under the server
   
   ![Cursor MCP Server Listed](public/cursor-setup-04.png)

5. **Test the Tool**:
   - In the chat sidebar, ensure Agent mode is active
   - Try asking Cursor AI to use one of the available tools
   - For example: "List all Confluence spaces" or "Get details about Confluence space with ID 123456"
   - Cursor AI will use the MCP tool to fetch and display the requested information

## Prerequisites

- **Node.js**: v22.14.0 or higher (specified in `.node-version` and `package.json`).
- **npm**: Comes with Node.js, used for package management.
- **Atlassian Confluence Access**: You'll need access to a Confluence instance and appropriate API credentials.

## Installation

Install dependencies locally:

```bash
npm install
```

This sets up the project with `@modelcontextprotocol/sdk` and development tools like `tsup`, `jest`, and `eslint`.

## Running Locally

Run the compiled JavaScript code:

```bash
npm start
```

This executes `node dist/index.cjs`, starting the MCP server with `stdio` transport.

## Configuration

The server supports multiple configuration methods with the following priority order (highest to lowest):

1. **Direct Environment Variables**: Set environment variables directly when running the command.
   ```bash
   DEBUG=true ATLASSIAN_SITE_NAME=your_site_name ATLASSIAN_USER_EMAIL=your_email ATLASSIAN_API_TOKEN=your_token npx -y aashari/mcp-atlassian-confluence
   ```

2. **.env File**: Create a `.env` file in the project root directory.
   ```
   DEBUG=true
   ATLASSIAN_SITE_NAME=your_site_name
   ATLASSIAN_USER_EMAIL=your_email
   ATLASSIAN_API_TOKEN=your_token
   ```

3. **Global Configuration File**: Create a global configuration file at `$HOME/.mcp/configs.json`.
   ```json
   {
     "@aashari/mcp-atlassian-confluence": {
       "environments": {
         "DEBUG": "true",
         "ATLASSIAN_SITE_NAME": "your_site_name",
         "ATLASSIAN_USER_EMAIL": "your_email",
         "ATLASSIAN_API_TOKEN": "your_token"
       }
     }
   }
   ```

### Available Configuration Options

- **DEBUG**: Set to `true` to enable debug logging.
- **ATLASSIAN_SITE_NAME**: Your Atlassian site name (e.g., for `https://example.atlassian.net`, use `example`).
- **ATLASSIAN_USER_EMAIL**: Email address associated with your Atlassian account.
- **ATLASSIAN_API_TOKEN**: API token for Atlassian API access.

### Configuration Priority

The configuration system follows a cascading priority where values from higher priority sources override lower priority ones. This allows you to:
- Use global configuration for shared settings across projects
- Override global settings with project-specific settings in `.env`
- Override both with command-line environment variables for temporary changes

## Project Structure

The project follows a clean architecture pattern with clear separation of concerns:

- **`src/index.ts`**: Main entry point, initializes the MCP server or CLI based on arguments.
- **`src/controllers/`**: Business logic for operations.
  - `atlassian.spaces.controller.ts`: Handles Confluence spaces operations
  - `atlassian.spaces.type.ts`: Type definitions for the controller
- **`src/services/`**: External API integration.
  - `vendor.atlassian.spaces.service.ts`: Interacts with Atlassian Confluence API for spaces
  - `vendor.atlassian.spaces.types.ts`: Type definitions for the service
- **`src/tools/`**: MCP tool definitions with Zod schemas.
  - `atlassian.spaces.tool.ts`: Implements MCP tools for Confluence spaces
  - `atlassian.spaces.type.ts`: Type definitions for the tools
- **`src/cli/`**: CLI command definitions.
  - `atlassian.spaces.cli.ts`: Implements CLI commands for Confluence spaces
- **`src/utils/`**: Shared utilities, including `transport.util.ts` for Confluence API integration.
- **`dist/`**: Compiled output (generated by `tsup`).

## Testing

Run unit tests:

```bash
npm test
```

Generate a test coverage report:

```bash
npm run test:coverage
```

Tests in `src/**/*.test.ts` verify controller and service functionality using Jest.

## Development

### Building and Running

```bash
# Build the project
npm run build

# Run the MCP server
npm start

# Run a CLI command
npm start -- list-spaces

# Run with the MCP Inspector for debugging
npm run inspector
```

### Fork Relationship

This project extends the boilerplate-mcp-server with Atlassian Confluence integration capabilities:

- **Added Features**: Adds Confluence API integration via the `fetchAtlassian` utility in `src/utils/transport.util.ts`.
- **Upstream Updates**: Maintains a remote connection to the boilerplate repository, allowing future improvements to be merged:
  ```bash
  # To pull in updates from the boilerplate
  git fetch boilerplate
  git merge boilerplate/main
  ```

### Extending with More Confluence Features

The project is designed to be extended with additional Confluence-specific functionality:

1. Use the `fetchAtlassian` utility in `src/utils/transport.util.ts` for API calls
2. Create new tools in `src/tools/` for additional Confluence operations
3. Add resources in `src/resources/` for Confluence content
4. Implement CLI commands in `src/cli/` for human interaction

For detailed development guidelines, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Version Management

Update the project version across `package.json`, `src/index.ts`, and CLI constants:

```bash
npm run update-version <new-version>
```

Example: `npm run update-version 1.8.0`. This script ensures version consistency, validated against SemVer format.

## Contributing

Contributions are welcome! Fork the repository, make changes, and submit a pull request to `main`. Ensure tests pass and formatting/linting standards are met.

## License

[ISC](https://opensource.org/licenses/ISC)
