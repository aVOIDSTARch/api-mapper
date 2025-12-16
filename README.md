# API Mapper

Generate fully-typed TypeScript API clients from OpenAPI/Swagger specifications.

## Features

- Fetches and validates OpenAPI 3.x and Swagger 2.x specifications
- Auto-discovers specs at common locations if URL doesn't point directly to one
- Generates TypeScript interfaces for all schemas and operations
- Generates typed API client class with methods grouped by tag
- Generates markdown documentation with endpoint details and models
- Organizes output by API origin (hostname)
- Built-in development server to browse and download generated files

## Installation

```bash
npm install
npm run build
```

## Usage

### Generate a client

```bash
# From direct spec URL
npx api-mapper generate https://petstore3.swagger.io/api/v3/openapi.json

# From base URL (auto-discovers spec)
npx api-mapper generate https://petstore3.swagger.io

# Custom output directory
npx api-mapper generate https://api.example.com -o ./src/apis

# Skip documentation
npx api-mapper generate https://api.example.com --no-docs

# Documentation only
npx api-mapper generate https://api.example.com --docs-only
```

### List generated clients

```bash
npx api-mapper list
```

### Serve generated files

```bash
# Serve on default port 3000
npx api-mapper serve petstore3.swagger.io

# Serve on custom port
npx api-mapper serve petstore3.swagger.io --port 8080
```

## Generated Output

For each API, the following files are generated in `api-clients/<hostname>/`:

| File            | Description                                      |
|-----------------|--------------------------------------------------|
| `manifest.json` | API metadata and generation info                 |
| `types.ts`      | TypeScript interfaces for schemas and operations |
| `client.ts`     | Typed API client class                           |
| `API.md`        | Markdown documentation                           |

## Example Usage

```typescript
import { createPetstore3SwaggerIoClient } from "./api-clients/petstore3.swagger.io/client.js";

const api = createPetstore3SwaggerIoClient({
  baseUrl: "https://petstore3.swagger.io/api/v3",
});

// Fully typed methods
const pet = await api.pet.getPetById({ petId: 1 });
const pets = await api.pet.findPetsByStatus({ status: "available" });

// Create a new pet
await api.pet.addPet({
  name: "Fluffy",
  photoUrls: ["https://example.com/photo.jpg"],
  status: "available",
});
```

## CLI Reference

```text
Usage: api-mapper [options] [command] [url]

Generate TypeScript API clients from OpenAPI specifications

Commands:
  generate [options] <url>  Generate TypeScript client from OpenAPI spec
  list [options]            List all generated API clients
  serve [options] <origin>  Serve a generated API client

Options:
  -V, --version             output the version number
  -o, --output <dir>        Output directory (default: "./api-clients")
  -n, --name <name>         Override origin folder name
  --docs-only               Generate only markdown documentation
  --no-docs                 Skip markdown documentation generation
  -h, --help                display help for command
```

## Spec Discovery

If the provided URL doesn't point directly to an OpenAPI spec, the tool will
attempt to discover one at these common locations:

- `/openapi.json`, `/openapi.yaml`
- `/swagger.json`, `/swagger.yaml`
- `/api-docs`, `/v3/api-docs`, `/v2/api-docs`
- `/api/v3/openapi.json`, `/api/v3/openapi.yaml`
- `/docs/openapi.json`, `/docs/swagger.json`
- `/.well-known/openapi.json`

## License

ISC
