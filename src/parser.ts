import type { OpenAPI, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

/**
 * Parsed parameter information
 */
export interface ParsedParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  description?: string;
  type: string;
  format?: string;
}

/**
 * Parsed request body information
 */
export interface ParsedRequestBody {
  required: boolean;
  description?: string;
  contentType: string;
  schema: ParsedSchema;
}

/**
 * Parsed response information
 */
export interface ParsedResponse {
  statusCode: string;
  description: string;
  contentType?: string;
  schema?: ParsedSchema;
}

/**
 * Parsed schema/type information
 */
export interface ParsedSchema {
  type: string;
  format?: string;
  description?: string;
  properties?: Record<string, ParsedSchema>;
  items?: ParsedSchema;
  required?: string[];
  enum?: string[];
  nullable?: boolean;
  ref?: string;
}

/**
 * Parsed operation (endpoint method)
 */
export interface ParsedOperation {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: ParsedParameter[];
  requestBody?: ParsedRequestBody;
  responses: ParsedResponse[];
  deprecated: boolean;
}

/**
 * Parsed API information
 */
export interface ParsedApi {
  title: string;
  version: string;
  description?: string;
  baseUrl?: string;
  operations: ParsedOperation[];
  schemas: Record<string, ParsedSchema>;
  tags: Array<{ name: string; description?: string }>;
}

type SchemaObject = OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
type ReferenceObject = OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject;
type ParameterObject = OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject;
type RequestBodyObject =
  | OpenAPIV3.RequestBodyObject
  | OpenAPIV3_1.RequestBodyObject;
type ResponseObject = OpenAPIV3.ResponseObject | OpenAPIV3_1.ResponseObject;

/**
 * Check if an object is a reference
 */
function isReference(obj: unknown): obj is ReferenceObject {
  return typeof obj === "object" && obj !== null && "$ref" in obj;
}

/**
 * Extract reference name from $ref string
 */
function getRefName(ref: string): string {
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

/**
 * Convert OpenAPI schema to parsed schema
 */
function parseSchema(
  schema: SchemaObject | ReferenceObject | undefined
): ParsedSchema {
  if (!schema) {
    return { type: "unknown" };
  }

  if (isReference(schema)) {
    return { type: getRefName(schema.$ref), ref: schema.$ref };
  }

  const result: ParsedSchema = {
    type: schema.type as string || "object",
    description: schema.description,
    nullable: "nullable" in schema ? schema.nullable : undefined,
  };

  if (schema.format) {
    result.format = schema.format;
  }

  if (schema.enum) {
    result.enum = schema.enum as string[];
    result.type = "enum";
  }

  if (schema.type === "array" && schema.items) {
    result.items = parseSchema(schema.items as SchemaObject | ReferenceObject);
  }

  if (schema.type === "object" || schema.properties) {
    result.properties = {};
    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        result.properties[key] = parseSchema(value as SchemaObject);
      }
    }
    if (schema.required) {
      result.required = schema.required;
    }
  }

  // Handle allOf, oneOf, anyOf by taking first item for simplicity
  if ("allOf" in schema && Array.isArray(schema.allOf) && schema.allOf[0]) {
    return parseSchema(schema.allOf[0] as SchemaObject);
  }
  if ("oneOf" in schema && Array.isArray(schema.oneOf) && schema.oneOf[0]) {
    return parseSchema(schema.oneOf[0] as SchemaObject);
  }
  if ("anyOf" in schema && Array.isArray(schema.anyOf) && schema.anyOf[0]) {
    return parseSchema(schema.anyOf[0] as SchemaObject);
  }

  return result;
}

/**
 * Parse a parameter object
 */
function parseParameter(param: ParameterObject): ParsedParameter {
  const schema = param.schema as SchemaObject | undefined;

  return {
    name: param.name,
    in: param.in as ParsedParameter["in"],
    required: param.required || false,
    description: param.description,
    type: schema?.type as string || "string",
    format: schema?.format,
  };
}

/**
 * Parse request body
 */
function parseRequestBody(
  requestBody: RequestBodyObject | ReferenceObject | undefined
): ParsedRequestBody | undefined {
  if (!requestBody || isReference(requestBody)) {
    return undefined;
  }

  const content = requestBody.content;
  const contentType =
    Object.keys(content).find((ct) => ct.includes("json")) ||
    Object.keys(content)[0];

  if (!contentType || !content[contentType]) {
    return undefined;
  }

  const mediaType = content[contentType];

  return {
    required: requestBody.required || false,
    description: requestBody.description,
    contentType,
    schema: parseSchema(mediaType.schema as SchemaObject | ReferenceObject),
  };
}

/**
 * Parse responses
 */
function parseResponses(
  responses: OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject
): ParsedResponse[] {
  const result: ParsedResponse[] = [];

  for (const [statusCode, response] of Object.entries(responses)) {
    if (isReference(response)) {
      result.push({
        statusCode,
        description: `Reference: ${response.$ref}`,
      });
      continue;
    }

    const resp = response as ResponseObject;
    const parsed: ParsedResponse = {
      statusCode,
      description: resp.description || "",
    };

    if (resp.content) {
      const contentType =
        Object.keys(resp.content).find((ct) => ct.includes("json")) ||
        Object.keys(resp.content)[0];

      if (contentType && resp.content[contentType]) {
        parsed.contentType = contentType;
        parsed.schema = parseSchema(
          resp.content[contentType].schema as SchemaObject | ReferenceObject
        );
      }
    }

    result.push(parsed);
  }

  return result;
}

/**
 * Generate operation ID if not provided
 */
function generateOperationId(method: string, path: string): string {
  const parts = path
    .split("/")
    .filter((p) => p && !p.startsWith("{"))
    .map((p, i) =>
      i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1)
    );

  return `${method.toLowerCase()}${parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("")}`;
}

/**
 * Parse OpenAPI specification into a structured format
 */
export function parseOpenApiSpec(spec: OpenAPI.Document): ParsedApi {
  const doc = spec as OpenAPIV3.Document | OpenAPIV3_1.Document;

  // Extract base URL from servers
  let baseUrl: string | undefined;
  if (doc.servers && doc.servers.length > 0) {
    baseUrl = doc.servers[0].url;
  }

  // Parse all operations
  const operations: ParsedOperation[] = [];
  const paths = doc.paths || {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;

    const methods = ["get", "post", "put", "patch", "delete", "head", "options"];

    for (const method of methods) {
      const operation = (pathItem as Record<string, unknown>)[method] as
        | OpenAPIV3.OperationObject
        | OpenAPIV3_1.OperationObject
        | undefined;

      if (!operation) continue;

      // Collect parameters from path and operation level
      const allParams: ParameterObject[] = [];

      if (pathItem.parameters) {
        for (const p of pathItem.parameters) {
          if (!isReference(p)) {
            allParams.push(p as ParameterObject);
          }
        }
      }

      if (operation.parameters) {
        for (const p of operation.parameters) {
          if (!isReference(p)) {
            allParams.push(p as ParameterObject);
          }
        }
      }

      const parsedOp: ParsedOperation = {
        operationId:
          operation.operationId || generateOperationId(method, path),
        method: method.toUpperCase(),
        path,
        summary: operation.summary,
        description: operation.description,
        tags: operation.tags || [],
        parameters: allParams.map(parseParameter),
        requestBody: parseRequestBody(operation.requestBody),
        responses: parseResponses(operation.responses || {}),
        deprecated: operation.deprecated || false,
      };

      operations.push(parsedOp);
    }
  }

  // Parse component schemas
  const schemas: Record<string, ParsedSchema> = {};
  const components = doc.components;

  if (components?.schemas) {
    for (const [name, schema] of Object.entries(components.schemas)) {
      schemas[name] = parseSchema(schema as SchemaObject | ReferenceObject);
    }
  }

  // Parse tags
  const tags = (doc.tags || []).map((t) => ({
    name: t.name,
    description: t.description,
  }));

  return {
    title: doc.info.title,
    version: doc.info.version,
    description: doc.info.description,
    baseUrl,
    operations,
    schemas,
    tags,
  };
}
