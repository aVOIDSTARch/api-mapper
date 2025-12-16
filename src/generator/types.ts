import type { ParsedApi, ParsedSchema, ParsedOperation } from "../parser.js";

/**
 * Convert a parsed schema type to TypeScript type
 */
function schemaToTsType(schema: ParsedSchema, indent = 0): string {
  const spaces = "  ".repeat(indent);

  // Handle references
  if (schema.ref) {
    return schema.type;
  }

  // Handle enums
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum.map((v) => `"${v}"`).join(" | ");
  }

  // Handle arrays
  if (schema.type === "array" && schema.items) {
    const itemType = schemaToTsType(schema.items, indent);
    return `${itemType}[]`;
  }

  // Handle objects with properties
  if (schema.properties && Object.keys(schema.properties).length > 0) {
    const props = Object.entries(schema.properties)
      .map(([key, prop]) => {
        const optional = !schema.required?.includes(key) ? "?" : "";
        const propType = schemaToTsType(prop, indent + 1);
        const comment = prop.description
          ? `${spaces}  /** ${prop.description} */\n`
          : "";
        return `${comment}${spaces}  ${key}${optional}: ${propType};`;
      })
      .join("\n");

    return `{\n${props}\n${spaces}}`;
  }

  // Map OpenAPI types to TypeScript types
  switch (schema.type) {
    case "string":
      if (schema.format === "date" || schema.format === "date-time") {
        return "string";
      }
      if (schema.format === "binary") {
        return "Blob";
      }
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return "Record<string, unknown>";
    case "null":
      return "null";
    default:
      return "unknown";
  }
}

/**
 * Generate TypeScript interface for a schema
 */
function generateInterface(name: string, schema: ParsedSchema): string {
  const lines: string[] = [];

  if (schema.description) {
    lines.push(`/** ${schema.description} */`);
  }

  // Handle enums specially
  if (schema.enum && schema.enum.length > 0) {
    const enumValues = schema.enum.map((v) => `"${v}"`).join(" | ");
    lines.push(`export type ${name} = ${enumValues};`);
    return lines.join("\n");
  }

  // Handle objects with properties
  if (schema.properties && Object.keys(schema.properties).length > 0) {
    lines.push(`export interface ${name} {`);

    for (const [key, prop] of Object.entries(schema.properties)) {
      const optional = !schema.required?.includes(key) ? "?" : "";
      const propType = schemaToTsType(prop, 1);

      if (prop.description) {
        lines.push(`  /** ${prop.description} */`);
      }
      lines.push(`  ${key}${optional}: ${propType};`);
    }

    lines.push(`}`);
  } else {
    // Simple type alias
    const tsType = schemaToTsType(schema);
    lines.push(`export type ${name} = ${tsType};`);
  }

  return lines.join("\n");
}

/**
 * Generate parameter interface for an operation
 */
function generateParamsInterface(operation: ParsedOperation): string | null {
  const params = operation.parameters.filter(
    (p) => p.in === "query" || p.in === "path"
  );

  if (params.length === 0) {
    return null;
  }

  const lines: string[] = [];
  const interfaceName = `${pascalCase(operation.operationId)}Params`;

  lines.push(`export interface ${interfaceName} {`);

  for (const param of params) {
    const optional = !param.required ? "?" : "";
    let tsType = "string";

    switch (param.type) {
      case "integer":
      case "number":
        tsType = "number";
        break;
      case "boolean":
        tsType = "boolean";
        break;
      case "array":
        tsType = "string[]";
        break;
    }

    if (param.description) {
      lines.push(`  /** ${param.description} */`);
    }
    lines.push(`  ${param.name}${optional}: ${tsType};`);
  }

  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generate request body interface for an operation
 */
function generateRequestBodyInterface(
  operation: ParsedOperation
): string | null {
  if (!operation.requestBody) {
    return null;
  }

  const interfaceName = `${pascalCase(operation.operationId)}Request`;
  const schema = operation.requestBody.schema;

  // If it's a reference, just create a type alias
  if (schema.ref) {
    return `export type ${interfaceName} = ${schema.type};`;
  }

  // Generate full interface
  return generateInterface(interfaceName, schema);
}

/**
 * Generate response type for an operation
 */
function generateResponseType(operation: ParsedOperation): string {
  const successResponse = operation.responses.find(
    (r) => r.statusCode.startsWith("2") && r.schema
  );

  if (!successResponse?.schema) {
    return `export type ${pascalCase(operation.operationId)}Response = void;`;
  }

  const schema = successResponse.schema;
  const typeName = `${pascalCase(operation.operationId)}Response`;

  // If it's a reference, create type alias
  if (schema.ref) {
    return `export type ${typeName} = ${schema.type};`;
  }

  // If it's an array of references
  if (schema.type === "array" && schema.items?.ref) {
    return `export type ${typeName} = ${schema.items.type}[];`;
  }

  // Generate inline type
  const tsType = schemaToTsType(schema);
  return `export type ${typeName} = ${tsType};`;
}

/**
 * Convert string to PascalCase
 */
function pascalCase(str: string): string {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Generate all TypeScript types for an API
 */
export function generateTypes(api: ParsedApi): string {
  const lines: string[] = [];

  lines.push("// Auto-generated TypeScript types");
  lines.push("// Do not edit manually");
  lines.push("");

  // Generate schema interfaces
  lines.push("// ============ Schemas ============");
  lines.push("");

  for (const [name, schema] of Object.entries(api.schemas)) {
    lines.push(generateInterface(name, schema));
    lines.push("");
  }

  // Generate operation-specific types
  lines.push("// ============ Operation Types ============");
  lines.push("");

  for (const operation of api.operations) {
    // Parameters interface
    const paramsInterface = generateParamsInterface(operation);
    if (paramsInterface) {
      lines.push(paramsInterface);
      lines.push("");
    }

    // Request body interface
    const requestInterface = generateRequestBodyInterface(operation);
    if (requestInterface) {
      lines.push(requestInterface);
      lines.push("");
    }

    // Response type
    lines.push(generateResponseType(operation));
    lines.push("");
  }

  return lines.join("\n");
}
