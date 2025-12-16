import type {
  ParsedApi,
  ParsedOperation,
  ParsedParameter,
  ParsedSchema,
} from "../parser.js";

/**
 * Convert string to PascalCase
 */
function pascalCase(str: string): string {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Escape markdown special characters in table cells
 */
function escapeMarkdown(str: string): string {
  return str.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/**
 * Convert schema to readable type string
 */
function schemaToTypeString(schema: ParsedSchema): string {
  if (schema.ref) {
    return `\`${schema.type}\``;
  }

  if (schema.enum) {
    return schema.enum.map((e) => `\`"${e}"\``).join(" \\| ");
  }

  if (schema.type === "array" && schema.items) {
    return `${schemaToTypeString(schema.items)}[]`;
  }

  if (schema.properties) {
    return "`object`";
  }

  return `\`${schema.type}\``;
}

/**
 * Generate parameter table
 */
function generateParamTable(params: ParsedParameter[]): string[] {
  if (params.length === 0) return [];

  const lines: string[] = [];
  lines.push("");
  lines.push("| Parameter | Type | Required | Location | Description |");
  lines.push("|-----------|------|----------|----------|-------------|");

  for (const param of params) {
    const required = param.required ? "Yes" : "No";
    const description = param.description
      ? escapeMarkdown(param.description)
      : "-";
    lines.push(
      `| \`${param.name}\` | \`${param.type}\` | ${required} | ${param.in} | ${description} |`
    );
  }

  return lines;
}

/**
 * Generate request body documentation
 */
function generateRequestBodyDocs(op: ParsedOperation): string[] {
  if (!op.requestBody) return [];

  const lines: string[] = [];
  lines.push("");
  lines.push("**Request Body:**");
  lines.push("");

  if (op.requestBody.description) {
    lines.push(op.requestBody.description);
    lines.push("");
  }

  lines.push(`- Content-Type: \`${op.requestBody.contentType}\``);
  lines.push(
    `- Required: ${op.requestBody.required ? "Yes" : "No"}`
  );
  lines.push(`- Type: ${schemaToTypeString(op.requestBody.schema)}`);

  return lines;
}

/**
 * Generate response documentation
 */
function generateResponseDocs(op: ParsedOperation): string[] {
  const lines: string[] = [];
  lines.push("");
  lines.push("**Responses:**");
  lines.push("");

  for (const response of op.responses) {
    const schemaStr = response.schema
      ? schemaToTypeString(response.schema)
      : "No content";
    lines.push(
      `- \`${response.statusCode}\`: ${response.description} → ${schemaStr}`
    );
  }

  return lines;
}

/**
 * Generate documentation for a single operation
 */
function generateOperationDocs(op: ParsedOperation): string[] {
  const lines: string[] = [];

  // Method and path header
  lines.push(`### ${op.method} \`${op.path}\``);
  lines.push("");

  // Summary and description
  if (op.summary) {
    lines.push(`**${op.summary}**`);
    lines.push("");
  }

  if (op.description && op.description !== op.summary) {
    lines.push(op.description);
    lines.push("");
  }

  if (op.deprecated) {
    lines.push("> ⚠️ **Deprecated**: This endpoint is deprecated.");
    lines.push("");
  }

  // Operation ID
  lines.push(`- **Operation ID:** \`${op.operationId}\``);

  // Parameters table
  if (op.parameters.length > 0) {
    lines.push(...generateParamTable(op.parameters));
  }

  // Request body
  lines.push(...generateRequestBodyDocs(op));

  // Responses
  lines.push(...generateResponseDocs(op));

  lines.push("");
  lines.push("---");
  lines.push("");

  return lines;
}

/**
 * Generate schema documentation
 */
function generateSchemaDocs(name: string, schema: ParsedSchema): string[] {
  const lines: string[] = [];

  lines.push(`### ${name}`);
  lines.push("");

  if (schema.description) {
    lines.push(schema.description);
    lines.push("");
  }

  if (schema.enum) {
    lines.push("**Enum values:**");
    lines.push("");
    for (const value of schema.enum) {
      lines.push(`- \`"${value}"\``);
    }
    lines.push("");
    return lines;
  }

  if (schema.properties && Object.keys(schema.properties).length > 0) {
    lines.push("| Field | Type | Required | Description |");
    lines.push("|-------|------|----------|-------------|");

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const required = schema.required?.includes(fieldName) ? "Yes" : "No";
      const description = fieldSchema.description
        ? escapeMarkdown(fieldSchema.description)
        : "-";
      const typeStr = schemaToTypeString(fieldSchema);
      lines.push(`| \`${fieldName}\` | ${typeStr} | ${required} | ${description} |`);
    }

    lines.push("");
  }

  return lines;
}

/**
 * Generate quick start guide
 */
function generateQuickStart(api: ParsedApi, clientName: string): string[] {
  const lines: string[] = [];

  lines.push("## Quick Start");
  lines.push("");
  lines.push("### Installation");
  lines.push("");
  lines.push("Copy the generated `types.ts` and `client.ts` files to your project.");
  lines.push("");
  lines.push("### Usage");
  lines.push("");
  lines.push("```typescript");
  lines.push(`import { create${clientName} } from "./client.js";`);
  lines.push("");
  lines.push(`const api = create${clientName}({`);
  lines.push(`  baseUrl: "${api.baseUrl || "https://api.example.com"}",`);
  lines.push("});");
  lines.push("");

  // Find a simple GET operation for example
  const getOp = api.operations.find(
    (op) => op.method === "GET" && op.parameters.length === 0
  );
  if (getOp) {
    const tag = getOp.tags[0] || "default";
    const methodName = getOp.operationId
      .replace(/[-_](\w)/g, (_, c: string) => c.toUpperCase())
      .replace(/^\w/, (c) => c.toLowerCase());
    lines.push(`// Example: ${getOp.summary || getOp.operationId}`);
    lines.push(
      `const result = await api.${tag.toLowerCase()}.${methodName}();`
    );
    lines.push("console.log(result);");
  }

  lines.push("```");
  lines.push("");

  return lines;
}

/**
 * Generate full API documentation
 */
export function generateDocs(api: ParsedApi, clientName: string): string {
  const lines: string[] = [];

  // Title and overview
  lines.push(`# ${api.title}`);
  lines.push("");
  lines.push(`**Version:** ${api.version}`);
  lines.push("");

  if (api.description) {
    lines.push(api.description);
    lines.push("");
  }

  if (api.baseUrl) {
    lines.push(`**Base URL:** \`${api.baseUrl}\``);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // Quick start
  lines.push(...generateQuickStart(api, clientName));

  lines.push("---");
  lines.push("");

  // Table of contents
  lines.push("## Table of Contents");
  lines.push("");
  lines.push("- [Endpoints](#endpoints)");

  // Group by tags
  const tagGroups = new Map<string, ParsedOperation[]>();
  for (const op of api.operations) {
    const tag = op.tags[0] || "default";
    const existing = tagGroups.get(tag) || [];
    existing.push(op);
    tagGroups.set(tag, existing);
  }

  for (const tag of tagGroups.keys()) {
    const anchor = tag.toLowerCase().replace(/\s+/g, "-");
    lines.push(`  - [${pascalCase(tag)}](#${anchor})`);
  }

  lines.push("- [Models](#models)");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Endpoints section
  lines.push("## Endpoints");
  lines.push("");

  for (const [tag, ops] of tagGroups) {
    const tagDescription = api.tags.find((t) => t.name === tag)?.description;

    lines.push(`### ${pascalCase(tag)}`);
    lines.push("");

    if (tagDescription) {
      lines.push(tagDescription);
      lines.push("");
    }

    for (const op of ops) {
      lines.push(...generateOperationDocs(op));
    }
  }

  // Models section
  lines.push("## Models");
  lines.push("");

  for (const [name, schema] of Object.entries(api.schemas)) {
    lines.push(...generateSchemaDocs(name, schema));
  }

  return lines.join("\n");
}
