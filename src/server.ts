import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { createSocket } from "node:dgram";

/**
 * MIME types for common file extensions
 */
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".ts": "text/typescript",
  ".json": "application/json",
  ".md": "text/markdown",
  ".txt": "text/plain",
};

/**
 * Manifest structure
 */
interface Manifest {
  name: string;
  title: string;
  version: string;
  description?: string;
  sourceUrl: string;
  baseUrl?: string;
  generatedAt: string;
  files: string[];
  stats: {
    operations: number;
    schemas: number;
    tags: number;
  };
}

/**
 * Check if a port is available
 */
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createSocket("udp4");

    socket.once("error", () => {
      socket.close();
      resolve(false);
    });

    socket.once("listening", () => {
      socket.close();
      resolve(true);
    });

    socket.bind(port);
  });
}

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  const maxAttempts = 100;

  for (let i = 0; i < maxAttempts; i++) {
    // Try TCP connection test
    const available = await new Promise<boolean>((resolve) => {
      const server = createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });

    if (available) {
      return port;
    }
    port++;
  }

  throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}

/**
 * Generate HTML index page for the API client
 */
function generateIndexPage(manifest: Manifest, files: string[]): string {
  const fileLinks = files
    .map((f) => `<li><a href="/${f}">${f}</a></li>`)
    .join("\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${manifest.title} - API Client</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .meta { color: #666; font-size: 0.9rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      background: #e8e8e8;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .stats { display: flex; gap: 2rem; margin-top: 1rem; }
    .stat { text-align: center; }
    .stat-value { font-size: 1.5rem; font-weight: bold; color: #0066cc; }
    .stat-label { font-size: 0.8rem; color: #666; }
  </style>
</head>
<body>
  <h1>${manifest.title}</h1>
  <p class="meta">Version ${manifest.version} | Generated ${new Date(manifest.generatedAt).toLocaleDateString()}</p>

  <div class="card">
    <h2>API Information</h2>
    ${manifest.description ? `<p>${manifest.description.split("\n")[0]}</p>` : ""}
    <p><strong>Source:</strong> <a href="${manifest.sourceUrl}" target="_blank">${manifest.sourceUrl}</a></p>
    ${manifest.baseUrl ? `<p><strong>Base URL:</strong> <code>${manifest.baseUrl}</code></p>` : ""}

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${manifest.stats.operations}</div>
        <div class="stat-label">Operations</div>
      </div>
      <div class="stat">
        <div class="stat-value">${manifest.stats.schemas}</div>
        <div class="stat-label">Schemas</div>
      </div>
      <div class="stat">
        <div class="stat-value">${manifest.stats.tags}</div>
        <div class="stat-label">Tags</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>Generated Files</h2>
    <ul>
        ${fileLinks}
    </ul>
  </div>

  <div class="card">
    <h2>Quick Start</h2>
    <p>Copy the TypeScript files to your project:</p>
    <pre><code>curl -O http://localhost:${process.env.PORT || 3000}/types.ts
curl -O http://localhost:${process.env.PORT || 3000}/client.ts</code></pre>
  </div>
</body>
</html>`;
}

/**
 * Handle HTTP requests
 */
async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  clientDir: string,
  manifest: Manifest
): Promise<void> {
  const url = req.url || "/";
  const path = url === "/" ? "/index.html" : url;

  // Serve index page
  if (path === "/index.html") {
    const html = generateIndexPage(manifest, ["manifest.json", ...manifest.files]);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // Serve files
  const filePath = join(clientDir, path.slice(1));

  try {
    // Check file exists
    await stat(filePath);

    const content = await readFile(filePath, "utf-8");
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": mimeType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(`File not found: ${path}`);
  }
}

/**
 * Start the development server
 */
export async function startServer(
  clientDir: string,
  requestedPort: number
): Promise<{ port: number; close: () => void }> {
  // Load manifest
  const manifestPath = join(clientDir, "manifest.json");
  let manifest: Manifest;

  try {
    const content = await readFile(manifestPath, "utf-8");
    manifest = JSON.parse(content);
  } catch {
    throw new Error(`Could not read manifest.json from ${clientDir}`);
  }

  // Find available port
  const port = await findAvailablePort(requestedPort);

  if (port !== requestedPort) {
    console.log(`Port ${requestedPort} in use, using ${port} instead`);
  }

  // Store port for index page
  process.env.PORT = String(port);

  // Create server
  const server = createServer((req, res) => {
    handleRequest(req, res, clientDir, manifest).catch((err) => {
      console.error("Request error:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal server error");
    });
  });

  // Start listening
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => {
      console.log(`\nServing ${manifest.title} v${manifest.version}`);
      console.log(`\n  Local:   http://localhost:${port}/`);
      console.log(`\n  Files:`);
      for (const file of manifest.files) {
        console.log(`    - http://localhost:${port}/${file}`);
      }
      console.log(`\nPress Ctrl+C to stop\n`);

      resolve({
        port,
        close: () => server.close(),
      });
    });
  });
}
