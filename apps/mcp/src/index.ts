#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Create server instance
const server = new McpServer({
  name: "shell-executor",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Interface for shell execution result
interface ShellExecutionResult {
  output: string;
  executionTimeMs: number;
  exitCode: number;
  error?: string;
}

// Helper function to execute shell commands with timing
async function executeShellCommand(command: string): Promise<ShellExecutionResult> {
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(command);
    const executionTimeMs = Date.now() - startTime;
    
    return {
      output: stdout.trim() || stderr.trim(),
      executionTimeMs,
      exitCode: 0
    };
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    
    return {
      output: error.stdout || "",
      executionTimeMs,
      exitCode: error.code || 1,
      error: error.stderr || error.message
    };
  }
}

// Register the echo hello world tool
server.tool(
  "echo-hello-world",
  "Execute 'echo Hello world' shell command and return output, execution time, and exit code",
  {},
  async () => {
    const result = await executeShellCommand("echo Hello world");
    
    const responseText = `Shell Command Execution Result:
Command: echo Hello world
Output: ${result.output}
Execution Time: ${result.executionTimeMs}ms
Exit Code: ${result.exitCode}${result.error ? `\nError: ${result.error}` : ''}`;

    return {
      content: [
        {
          type: "text",
          text: responseText,
        },
      ],
    };
  }
);

// Register a generic shell execution tool for flexibility
server.tool(
  "execute-shell-command",
  "Execute any shell command and return output, execution time, and exit code",
  {
    command: z.string().describe("The shell command to execute"),
  },
  async ({ command }) => {
    const result = await executeShellCommand(command);
    
    const responseText = `Shell Command Execution Result:
Command: ${command}
Output: ${result.output}
Execution Time: ${result.executionTimeMs}ms
Exit Code: ${result.exitCode}${result.error ? `\nError: ${result.error}` : ''}`;

    return {
      content: [
        {
          type: "text",
          text: responseText,
        },
      ],
    };
  }
);

// Main function to run the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shell Executor MCP Server running on stdio");
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.error("Shutting down server...");
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error("Shutting down server...");
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
