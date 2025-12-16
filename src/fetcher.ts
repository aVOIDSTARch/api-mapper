import SwaggerParser from "@apidevtools/swagger-parser";
import { parse as parseYaml } from "yaml";
import type { OpenAPI } from "openapi-types";

/**
 * Common locations where OpenAPI specs are typically found
 */
const SPEC_DISCOVERY_PATHS = [
  "/openapi.json",
  "/openapi.yaml",
  "/swagger.json",
  "/swagger.yaml",
  "/api-docs",
  "/v3/api-docs",
  "/v2/api-docs",
  "/api/v3/openapi.json",
  "/api/v3/openapi.yaml",
  "/api/v2/swagger.json",
  "/docs/openapi.json",
  "/docs/swagger.json",
  "/api/openapi.json",
  "/api/swagger.json",
  "/.well-known/openapi.json",
];

export interface FetchResult {
  spec: OpenAPI.Document;
  sourceUrl: string;
}

/**
 * Check if the response content looks like an OpenAPI/Swagger spec
 */
function isOpenApiSpec(data: unknown): data is OpenAPI.Document {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // OpenAPI 3.x has "openapi" field
  if (typeof obj.openapi === "string" && obj.openapi.startsWith("3.")) {
    return true;
  }

  // Swagger 2.x has "swagger" field
  if (typeof obj.swagger === "string" && obj.swagger.startsWith("2.")) {
    return true;
  }

  return false;
}

/**
 * Attempt to fetch and parse content from a URL
 */
async function fetchAndParse(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, application/yaml, text/yaml, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  // Try JSON first
  if (contentType.includes("json") || text.trimStart().startsWith("{")) {
    try {
      return JSON.parse(text);
    } catch {
      // Fall through to YAML
    }
  }

  // Try YAML
  try {
    return parseYaml(text);
  } catch {
    throw new Error("Could not parse response as JSON or YAML");
  }
}

/**
 * Get base URL from a full URL (removes path)
 */
function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

/**
 * Attempt to discover OpenAPI spec at common locations
 */
async function discoverSpec(baseUrl: string): Promise<FetchResult | null> {
  console.log(`\nAttempting to discover OpenAPI spec at common locations...`);

  for (const path of SPEC_DISCOVERY_PATHS) {
    const fullUrl = `${baseUrl}${path}`;
    console.log(`  Trying: ${fullUrl}`);

    try {
      const data = await fetchAndParse(fullUrl);

      if (isOpenApiSpec(data)) {
        console.log(`  ✓ Found valid OpenAPI spec!`);

        // Validate with swagger-parser
        const validated = await SwaggerParser.validate(
          data as OpenAPI.Document
        );
        return { spec: validated, sourceUrl: fullUrl };
      }
    } catch {
      // Continue to next path
    }
  }

  return null;
}

/**
 * Fetch and validate an OpenAPI specification from a URL.
 * If the URL doesn't point directly to a spec, attempts discovery at common locations.
 */
export async function fetchOpenApiSpec(url: string): Promise<FetchResult> {
  console.log(`Fetching: ${url}`);

  // First, try the provided URL directly
  try {
    const data = await fetchAndParse(url);

    if (isOpenApiSpec(data)) {
      console.log(`✓ Valid OpenAPI spec found at provided URL`);

      // Validate and dereference with swagger-parser
      const validated = await SwaggerParser.validate(data as OpenAPI.Document);
      return { spec: validated, sourceUrl: url };
    }

    console.log(`✗ URL does not contain a valid OpenAPI/Swagger spec`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`✗ Could not fetch from URL: ${message}`);
  }

  // If direct URL failed, try discovery
  const baseUrl = getBaseUrl(url);
  const discovered = await discoverSpec(baseUrl);

  if (discovered) {
    return discovered;
  }

  // All attempts failed
  throw new Error(
    `Could not find an OpenAPI specification.\n\n` +
      `Tried:\n` +
      `  1. Direct URL: ${url}\n` +
      `  2. Discovery at common paths under: ${baseUrl}\n\n` +
      `Please ensure the URL points to a valid OpenAPI 3.x or Swagger 2.x specification,\n` +
      `or that the API exposes a spec at a standard location.`
  );
}
