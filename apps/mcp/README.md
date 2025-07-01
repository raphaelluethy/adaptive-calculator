# Shell Executor MCP Server

A Model Context Protocol (MCP) server that executes shell commands and returns the output, execution time, and exit code.

## Features

- **echo-hello-world**: Executes `echo Hello world` and returns output, execution time, and exit code
- **execute-shell-command**: Executes any shell command and returns output, execution time, and exit code

## Installation

```bash
cd apps/mcp
pnpm install
pnpm build
```

## Usage

### Running the Server

```bash
# Start the server
node build/index.js
```

The server runs on stdio transport and communicates using the MCP protocol.

### Testing the Server

```bash
# Run the test script
node test-server.js
```

### Available Tools

#### 1. echo-hello-world
- **Description**: Execute 'echo Hello world' shell command and return output, execution time, and exit code
- **Parameters**: None
- **Returns**: 
  - Command executed
  - Output from the command
  - Execution time in milliseconds
  - Exit code

#### 2. execute-shell-command
- **Description**: Execute any shell command and return output, execution time, and exit code
- **Parameters**:
  - `command` (string): The shell command to execute
- **Returns**:
  - Command executed
  - Output from the command
  - Execution time in milliseconds
  - Exit code
  - Error message (if any)

## Example Output

When calling the `echo-hello-world` tool:

```
Shell Command Execution Result:
Command: echo Hello world
Output: Hello world
Execution Time: 21ms
Exit Code: 0
```

## Configuration for Claude Desktop

To use this server with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shell-executor": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/calculator/apps/mcp/build/index.js"]
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/calculator` with the actual path to your project.

## Security Note

The `execute-shell-command` tool can run any shell command, so use it with caution. Only use this server in trusted environments.

## Architecture

- Built with TypeScript and the MCP SDK
- Uses Node.js `child_process.exec` for command execution
- Measures execution time using `Date.now()`
- Handles both successful executions and errors
- Returns structured results with output, timing, and exit codes
