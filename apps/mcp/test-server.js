#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the MCP server
const serverPath = join(__dirname, 'build', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

function sendMessage(method, params = {}) {
  const message = {
    jsonrpc: "2.0",
    id: messageId++,
    method: method,
    params: params
  };
  
  const messageStr = JSON.stringify(message) + '\n';
  console.log('Sending:', messageStr.trim());
  server.stdin.write(messageStr);
}

function sendNotification(method, params = {}) {
  const message = {
    jsonrpc: "2.0",
    method: method,
    params: params
  };
  
  const messageStr = JSON.stringify(message) + '\n';
  console.log('Sending notification:', messageStr.trim());
  server.stdin.write(messageStr);
}

// Handle server output
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('Received:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Raw output:', line);
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Test sequence
setTimeout(() => {
  console.log('=== Testing MCP Server ===');
  
  // Initialize
  sendMessage('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {}
    },
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  });
  
  setTimeout(() => {
    sendNotification('initialized');
    
    setTimeout(() => {
      // List tools
      sendMessage('tools/list');
      
      setTimeout(() => {
        // Call the echo hello world tool
        sendMessage('tools/call', {
          name: "echo-hello-world",
          arguments: {}
        });
        
        setTimeout(() => {
          // Call the generic shell execution tool
          sendMessage('tools/call', {
            name: "execute-shell-command",
            arguments: {
              command: "echo Hello world"
            }
          });
          
          setTimeout(() => {
            server.kill();
          }, 1000);
        }, 1000);
      }, 1000);
    }, 500);
  }, 500);
}, 1000);

// Handle process termination
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
