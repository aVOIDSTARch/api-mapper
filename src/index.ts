#!/usr/bin/env node

import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Command } from "commander";
import { fetchOpenApiSpec } from "./fetcher.js";
import { parseOpenApiSpec, type ParsedApi } from "./parser.js";
import { generateTypes, generateClient, generateDocs } from "./generator/index.js";
import { startServer } from "./server.js";

/**
 * Manifest file structure for generated API clients
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
 * Extract origin (hostname) from a URL
 */
function getOriginName(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return "unknown-api";
  }
}

/**
 * Convert string to PascalCase
 */
function pascalCase(str: string): string {
  return str
    .replace(/[.-](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Generate all files for an API
 */
async function generateApiFiles(
  parsedApi: ParsedApi,
  _sourceUrl: string,
  outputDir: string,
  options: { docsOnly?: boolean; docs?: boolean; clientName?: string }
): Promise<string[]> {
  const generatedFiles: string[] = [];
  const clientName = options.clientName || "ApiClient";

  // Generate types
  if (!options.docsOnly) {
    console.log("\nGenerating TypeScript types...");
    const typesContent = generateTypes(parsedApi);
    const typesPath = join(outputDir, "types.ts");
    await writeFile(typesPath, typesContent, "utf-8");
    console.log(`  ✓ types.ts`);
    generatedFiles.push("types.ts");

    // Generate client
    console.log("Generating API client...");
    const clientContent = generateClient(parsedApi, clientName);
    const clientPath = join(outputDir, "client.ts");
    await writeFile(clientPath, clientContent, "utf-8");
    console.log(`  ✓ client.ts`);
    generatedFiles.push("client.ts");
  }

  // Generate documentation
  if (options.docs !== false) {
    console.log("Generating API documentation...");
    const docsContent = generateDocs(parsedApi, clientName);
    const docsPath = join(outputDir, "API.md");
    await writeFile(docsPath, docsContent, "utf-8");
    console.log(`  ✓ API.md`);
    generatedFiles.push("API.md");
  }

  return generatedFiles;
}

/**
 * Create manifest file
 */
function createManifest(
  parsedApi: ParsedApi,
  sourceUrl: string,
  originName: string,
  files: string[]
): Manifest {
  return {
    name: originName,
    title: parsedApi.title,
    version: parsedApi.version,
    description: parsedApi.description,
    sourceUrl,
    baseUrl: parsedApi.baseUrl,
    generatedAt: new Date().toISOString(),
    files,
    stats: {
      operations: parsedApi.operations.length,
      schemas: Object.keys(parsedApi.schemas).length,
      tags: parsedApi.tags.length,
    },
  };
}

const program = new Command();

program
  .name("api-mapper")
  .description("Generate TypeScript API clients from OpenAPI specifications")
  .version("1.0.0");

// Generate command
program
  .command("generate")
  .description("Generate TypeScript client from OpenAPI specification")
  .argument("<url>", "URL to OpenAPI/Swagger specification or API base URL")
  .option("-o, --output <dir>", "Output directory", "./api-clients")
  .option("-n, --name <name>", "Override origin folder name")
  .option("--docs-only", "Generate only markdown documentation")
  .option("--no-docs", "Skip markdown documentation generation")
  .action(async (url: string, options) => {
    console.log("API Mapper v1.0.0\n");

    try {
      // Step 2: Fetch and validate OpenAPI spec
      const { spec, sourceUrl } = await fetchOpenApiSpec(url);

      // Step 3: Parse spec into internal model
      console.log("\nParsing specification...");
      const parsedApi = parseOpenApiSpec(spec);

      console.log(`\nAPI: ${parsedApi.title} v${parsedApi.version}`);
      if (parsedApi.description) {
        console.log(`Description: ${parsedApi.description.slice(0, 100)}...`);
      }
      if (parsedApi.baseUrl) {
        console.log(`Base URL: ${parsedApi.baseUrl}`);
      }
      console.log(`Source: ${sourceUrl}`);
      console.log(`\nFound:`);
      console.log(`  - ${parsedApi.operations.length} operations`);
      console.log(`  - ${Object.keys(parsedApi.schemas).length} schemas`);
      console.log(`  - ${parsedApi.tags.length} tags`);

      // Create origin-based output directory
      const originName = options.name || getOriginName(sourceUrl);
      const outputDir = join(options.output, originName);
      await mkdir(outputDir, { recursive: true });

      // Generate files
      const generatedFiles = await generateApiFiles(
        parsedApi,
        sourceUrl,
        outputDir,
        { ...options, clientName: pascalCase(originName) + "Client" }
      );

      // Create and save manifest
      const manifest = createManifest(
        parsedApi,
        sourceUrl,
        originName,
        generatedFiles
      );
      const manifestPath = join(outputDir, "manifest.json");
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
      console.log(`  ✓ manifest.json`);

      console.log(`\nGenerated to: ${outputDir}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\nError: ${message}`);
      process.exit(1);
    }
  });

// List command
program
  .command("list")
  .description("List all generated API clients")
  .option("-o, --output <dir>", "Output directory", "./api-clients")
  .action(async (options) => {
    try {
      const entries = await readdir(options.output, { withFileTypes: true });
      const dirs = entries.filter((e) => e.isDirectory());

      if (dirs.length === 0) {
        console.log("No generated API clients found.");
        console.log(`\nRun 'api-mapper generate <url>' to create one.`);
        return;
      }

      console.log("Generated API Clients:\n");

      for (const dir of dirs) {
        const manifestPath = join(options.output, dir.name, "manifest.json");
        try {
          const manifestContent = await readFile(manifestPath, "utf-8");
          const manifest: Manifest = JSON.parse(manifestContent);
          console.log(`  ${manifest.name}`);
          console.log(`    Title: ${manifest.title} v${manifest.version}`);
          console.log(`    Operations: ${manifest.stats.operations}`);
          console.log(`    Generated: ${manifest.generatedAt}`);
          console.log("");
        } catch {
          console.log(`  ${dir.name} (no manifest)`);
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.log("No api-clients directory found.");
        console.log(`\nRun 'api-mapper generate <url>' to create one.`);
      } else {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exit(1);
      }
    }
  });

// Serve command
program
  .command("serve")
  .description("Serve a generated API client")
  .argument("<origin>", "Origin name of the API client to serve")
  .option("-o, --output <dir>", "Output directory", "./api-clients")
  .option("-p, --port <port>", "Port to serve on", "3000")
  .action(async (origin: string, options) => {
    const clientDir = join(options.output, origin);

    try {
      await startServer(clientDir, parseInt(options.port, 10));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${message}`);
      process.exit(1);
    }
  });

// Default command (generate) for backwards compatibility
program
  .argument("[url]", "URL to OpenAPI/Swagger specification")
  .option("-o, --output <dir>", "Output directory", "./api-clients")
  .option("-n, --name <name>", "Override origin folder name")
  .option("--docs-only", "Generate only markdown documentation")
  .option("--no-docs", "Skip markdown documentation generation")
  .action(async (url: string | undefined, _options) => {
    if (!url) {
      program.help();
      return;
    }

    // Delegate to generate command
    await program.commands
      .find((c) => c.name() === "generate")
      ?.parseAsync(["generate", url, ...process.argv.slice(3)], { from: "user" });
  });

program.parse();
