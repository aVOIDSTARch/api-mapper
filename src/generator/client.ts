import type { ParsedApi, ParsedOperation, ParsedParameter } from "../parser.js";

/**
 * Convert string to PascalCase
 */
function pascalCase(str: string): string {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Convert string to camelCase
 */
function camelCase(str: string): string {
  const pascal = pascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Group operations by tag
 */
function groupByTag(
  operations: ParsedOperation[]
): Map<string, ParsedOperation[]> {
  const groups = new Map<string, ParsedOperation[]>();

  for (const op of operations) {
    const tag = op.tags[0] || "default";
    const existing = groups.get(tag) || [];
    existing.push(op);
    groups.set(tag, existing);
  }

  return groups;
}

/**
 * Generate method name from operation
 */
function getMethodName(op: ParsedOperation): string {
  return camelCase(op.operationId);
}

/**
 * Get TypeScript type for response
 */
function getResponseType(op: ParsedOperation): string {
  return `${pascalCase(op.operationId)}Response`;
}

/**
 * Get TypeScript type for params
 */
function getParamsType(op: ParsedOperation): string | null {
  const params = op.parameters.filter(
    (p) => p.in === "query" || p.in === "path"
  );
  if (params.length === 0) return null;
  return `${pascalCase(op.operationId)}Params`;
}

/**
 * Get TypeScript type for request body
 */
function getRequestType(op: ParsedOperation): string | null {
  if (!op.requestBody) return null;
  return `${pascalCase(op.operationId)}Request`;
}

/**
 * Generate path with parameter interpolation
 */
function generatePathInterpolation(
  path: string,
  pathParams: ParsedParameter[]
): string {
  let result = path;
  for (const param of pathParams) {
    result = result.replace(`{${param.name}}`, `\${params.${param.name}}`);
  }
  return result;
}

/**
 * Generate query string building code
 */
function generateQueryBuilder(queryParams: ParsedParameter[]): string[] {
  if (queryParams.length === 0) return [];

  const lines: string[] = [];
  lines.push("    const queryParams = new URLSearchParams();");

  for (const param of queryParams) {
    const condition = param.required
      ? ""
      : `if (params.${param.name} !== undefined) `;
    lines.push(
      `    ${condition}queryParams.set("${param.name}", String(params.${param.name}));`
    );
  }

  lines.push(
    '    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";'
  );

  return lines;
}

/**
 * Generate a single API method
 */
function generateMethod(op: ParsedOperation, baseUrlVar: string): string {
  const lines: string[] = [];
  const methodName = getMethodName(op);
  const responseType = getResponseType(op);
  const paramsType = getParamsType(op);
  const requestType = getRequestType(op);

  const pathParams = op.parameters.filter((p) => p.in === "path");
  const queryParams = op.parameters.filter((p) => p.in === "query");

  // Build function signature
  const params: string[] = [];
  if (paramsType) {
    const allOptional = op.parameters.every((p) => !p.required);
    params.push(`params${allOptional ? "?" : ""}: ${paramsType}`);
  }
  if (requestType) {
    params.push(`body: ${requestType}`);
  }

  // JSDoc comment
  if (op.summary || op.description) {
    lines.push("    /**");
    if (op.summary) lines.push(`     * ${op.summary}`);
    if (op.description && op.description !== op.summary) {
      lines.push(`     * ${op.description}`);
    }
    if (op.deprecated) lines.push("     * @deprecated");
    lines.push("     */");
  }

  // Method signature
  lines.push(
    `    ${methodName}: async (${params.join(", ")}): Promise<${responseType}> => {`
  );

  // Path building
  const pathExpr =
    pathParams.length > 0
      ? `\`${generatePathInterpolation(op.path, pathParams)}\``
      : `"${op.path}"`;

  // Query string building
  const queryLines = generateQueryBuilder(queryParams);
  lines.push(...queryLines);

  const queryAppend = queryParams.length > 0 ? " + queryString" : "";

  // Fetch call
  const fetchOptions: string[] = [];
  fetchOptions.push(`method: "${op.method}"`);

  if (requestType) {
    fetchOptions.push('headers: { "Content-Type": "application/json" }');
    fetchOptions.push("body: JSON.stringify(body)");
  }

  lines.push(
    `      const response = await fetch(${baseUrlVar} + ${pathExpr}${queryAppend}, {`
  );
  lines.push(`        ${fetchOptions.join(",\n        ")}`);
  lines.push("      });");

  // Response handling
  lines.push("");
  lines.push("      if (!response.ok) {");
  lines.push(
    "        throw new Error(`HTTP ${response.status}: ${response.statusText}`);"
  );
  lines.push("      }");
  lines.push("");

  // Return based on response type
  if (responseType.endsWith("void")) {
    lines.push("      return;");
  } else {
    lines.push("      return response.json();");
  }

  lines.push("    },");

  return lines.join("\n");
}

/**
 * Generate the API client class
 */
export function generateClient(api: ParsedApi, clientName: string): string {
  const lines: string[] = [];

  // Header
  lines.push("// Auto-generated API client");
  lines.push("// Do not edit manually");
  lines.push("");

  // Import types
  lines.push('import type {');
  const typeImports = new Set<string>();

  for (const op of api.operations) {
    typeImports.add(`${pascalCase(op.operationId)}Response`);

    const paramsType = getParamsType(op);
    if (paramsType) typeImports.add(paramsType);

    const requestType = getRequestType(op);
    if (requestType) typeImports.add(requestType);
  }

  lines.push(`  ${Array.from(typeImports).join(",\n  ")}`);
  lines.push('} from "./types.js";');
  lines.push("");

  // Client config interface
  lines.push("export interface ClientConfig {");
  lines.push("  baseUrl: string;");
  lines.push("  headers?: Record<string, string>;");
  lines.push("}");
  lines.push("");

  // Client class
  lines.push(`export class ${clientName} {`);
  lines.push("  private baseUrl: string;");
  lines.push("  private headers: Record<string, string>;");
  lines.push("");
  lines.push("  constructor(config: ClientConfig) {");
  lines.push('    this.baseUrl = config.baseUrl.replace(/\\/$/, "");');
  lines.push("    this.headers = config.headers || {};");
  lines.push("  }");
  lines.push("");

  // Group operations by tag
  const groupedOps = groupByTag(api.operations);

  for (const [tag, ops] of groupedOps) {
    const tagName = camelCase(tag);

    lines.push(`  ${tagName} = {`);

    for (const op of ops) {
      lines.push(generateMethod(op, "this.baseUrl"));
      lines.push("");
    }

    // Remove trailing newline from last method
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    lines.push("  };");
    lines.push("");
  }

  lines.push("}");
  lines.push("");

  // Export default instance factory
  lines.push("/**");
  lines.push(" * Create a new API client instance");
  lines.push(" */");
  lines.push(
    `export function create${clientName}(config: ClientConfig): ${clientName} {`
  );
  lines.push(`  return new ${clientName}(config);`);
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}
