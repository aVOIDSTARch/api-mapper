# Swagger Petstore - OpenAPI 3.0

**Version:** 1.0.27

This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
You can now help us improve the API whether it's by making changes to the definition itself or to the code.
That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

Some useful links:
- [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
- [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)

**Base URL:** `/api/v3`

---

## Quick Start

### Installation

Copy the generated `types.ts` and `client.ts` files to your project.

### Usage

```typescript
import { createPetstore3SwaggerIoClient } from "./client.js";

const api = createPetstore3SwaggerIoClient({
  baseUrl: "/api/v3",
});

// Example: Returns pet inventories by status.
const result = await api.store.getInventory();
console.log(result);
```

---

## Table of Contents

- [Endpoints](#endpoints)
  - [Pet](#pet)
  - [Store](#store)
  - [User](#user)
- [Models](#models)

---

## Endpoints

### Pet

Everything about your Pets

### POST `/pet`

**Add a new pet to the store.**

- **Operation ID:** `addPet`

**Request Body:**

Create a new pet in the store

- Content-Type: `application/json`
- Required: Yes
- Type: `object`

**Responses:**

- `200`: Successful operation → `object`
- `400`: Invalid input → No content
- `422`: Validation exception → No content
- `default`: Unexpected error → No content

---

### PUT `/pet`

**Update an existing pet.**

Update an existing pet by Id.

- **Operation ID:** `updatePet`

**Request Body:**

Update an existent pet in the store

- Content-Type: `application/json`
- Required: Yes
- Type: `object`

**Responses:**

- `200`: Successful operation → `object`
- `400`: Invalid ID supplied → No content
- `404`: Pet not found → No content
- `422`: Validation exception → No content
- `default`: Unexpected error → No content

---

### GET `/pet/findByStatus`

**Finds Pets by status.**

Multiple status values can be provided with comma separated strings.

- **Operation ID:** `findPetsByStatus`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `status` | `string` | Yes | query | Status values that need to be considered for filter |

**Responses:**

- `200`: successful operation → `object`[]
- `400`: Invalid status value → No content
- `default`: Unexpected error → No content

---

### GET `/pet/findByTags`

**Finds Pets by tags.**

Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.

- **Operation ID:** `findPetsByTags`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `tags` | `array` | Yes | query | Tags to filter by |

**Responses:**

- `200`: successful operation → `object`[]
- `400`: Invalid tag value → No content
- `default`: Unexpected error → No content

---

### GET `/pet/{petId}`

**Find pet by ID.**

Returns a single pet.

- **Operation ID:** `getPetById`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `petId` | `integer` | Yes | path | ID of pet to return |

**Responses:**

- `200`: successful operation → `object`
- `400`: Invalid ID supplied → No content
- `404`: Pet not found → No content
- `default`: Unexpected error → No content

---

### POST `/pet/{petId}`

**Updates a pet in the store with form data.**

Updates a pet resource based on the form data.

- **Operation ID:** `updatePetWithForm`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `petId` | `integer` | Yes | path | ID of pet that needs to be updated |
| `name` | `string` | No | query | Name of pet that needs to be updated |
| `status` | `string` | No | query | Status of pet that needs to be updated |

**Responses:**

- `200`: successful operation → `object`
- `400`: Invalid input → No content
- `default`: Unexpected error → No content

---

### DELETE `/pet/{petId}`

**Deletes a pet.**

Delete a pet.

- **Operation ID:** `deletePet`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `api_key` | `string` | No | header | - |
| `petId` | `integer` | Yes | path | Pet id to delete |

**Responses:**

- `200`: Pet deleted → No content
- `400`: Invalid pet value → No content
- `default`: Unexpected error → No content

---

### POST `/pet/{petId}/uploadImage`

**Uploads an image.**

Upload image of the pet.

- **Operation ID:** `uploadFile`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `petId` | `integer` | Yes | path | ID of pet to update |
| `additionalMetadata` | `string` | No | query | Additional Metadata |

**Request Body:**

- Content-Type: `application/octet-stream`
- Required: No
- Type: `string`

**Responses:**

- `200`: successful operation → `object`
- `400`: No file uploaded → No content
- `404`: Pet not found → No content
- `default`: Unexpected error → No content

---

### Store

Access to Petstore orders

### GET `/store/inventory`

**Returns pet inventories by status.**

Returns a map of status codes to quantities.

- **Operation ID:** `getInventory`

**Responses:**

- `200`: successful operation → `object`
- `default`: Unexpected error → No content

---

### POST `/store/order`

**Place an order for a pet.**

Place a new order in the store.

- **Operation ID:** `placeOrder`

**Request Body:**

- Content-Type: `application/json`
- Required: No
- Type: `object`

**Responses:**

- `200`: successful operation → `object`
- `400`: Invalid input → No content
- `422`: Validation exception → No content
- `default`: Unexpected error → No content

---

### GET `/store/order/{orderId}`

**Find purchase order by ID.**

For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.

- **Operation ID:** `getOrderById`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `orderId` | `integer` | Yes | path | ID of order that needs to be fetched |

**Responses:**

- `200`: successful operation → `object`
- `400`: Invalid ID supplied → No content
- `404`: Order not found → No content
- `default`: Unexpected error → No content

---

### DELETE `/store/order/{orderId}`

**Delete purchase order by identifier.**

For valid response try integer IDs with value < 1000. Anything above 1000 or non-integers will generate API errors.

- **Operation ID:** `deleteOrder`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `orderId` | `integer` | Yes | path | ID of the order that needs to be deleted |

**Responses:**

- `200`: order deleted → No content
- `400`: Invalid ID supplied → No content
- `404`: Order not found → No content
- `default`: Unexpected error → No content

---

### User

Operations about user

### POST `/user`

**Create user.**

This can only be done by the logged in user.

- **Operation ID:** `createUser`

**Request Body:**

Created user object

- Content-Type: `application/json`
- Required: No
- Type: `object`

**Responses:**

- `200`: successful operation → `object`
- `default`: Unexpected error → No content

---

### POST `/user/createWithList`

**Creates list of users with given input array.**

- **Operation ID:** `createUsersWithListInput`

**Request Body:**

- Content-Type: `application/json`
- Required: No
- Type: `object`[]

**Responses:**

- `200`: Successful operation → `object`
- `default`: Unexpected error → No content

---

### GET `/user/login`

**Logs user into the system.**

Log into the system.

- **Operation ID:** `loginUser`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `username` | `string` | No | query | The user name for login |
| `password` | `string` | No | query | The password for login in clear text |

**Responses:**

- `200`: successful operation → `string`
- `400`: Invalid username/password supplied → No content
- `default`: Unexpected error → No content

---

### GET `/user/logout`

**Logs out current logged in user session.**

Log user out of the system.

- **Operation ID:** `logoutUser`

**Responses:**

- `200`: successful operation → No content
- `default`: Unexpected error → No content

---

### GET `/user/{username}`

**Get user by user name.**

Get user detail based on username.

- **Operation ID:** `getUserByName`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `username` | `string` | Yes | path | The name that needs to be fetched. Use user1 for testing |

**Responses:**

- `200`: successful operation → `object`
- `400`: Invalid username supplied → No content
- `404`: User not found → No content
- `default`: Unexpected error → No content

---

### PUT `/user/{username}`

**Update user resource.**

This can only be done by the logged in user.

- **Operation ID:** `updateUser`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `username` | `string` | Yes | path | name that need to be deleted |

**Request Body:**

Update an existent user in the store

- Content-Type: `application/json`
- Required: No
- Type: `object`

**Responses:**

- `200`: successful operation → No content
- `400`: bad request → No content
- `404`: user not found → No content
- `default`: Unexpected error → No content

---

### DELETE `/user/{username}`

**Delete user resource.**

This can only be done by the logged in user.

- **Operation ID:** `deleteUser`

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `username` | `string` | Yes | path | The name that needs to be deleted |

**Responses:**

- `200`: User deleted → No content
- `400`: Invalid username supplied → No content
- `404`: User not found → No content
- `default`: Unexpected error → No content

---

## Models

### Order

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `integer` | No | - |
| `petId` | `integer` | No | - |
| `quantity` | `integer` | No | - |
| `shipDate` | `string` | No | - |
| `status` | `"placed"` \| `"approved"` \| `"delivered"` | No | Order Status |
| `complete` | `boolean` | No | - |

### Category

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `integer` | No | - |
| `name` | `string` | No | - |

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `integer` | No | - |
| `username` | `string` | No | - |
| `firstName` | `string` | No | - |
| `lastName` | `string` | No | - |
| `email` | `string` | No | - |
| `password` | `string` | No | - |
| `phone` | `string` | No | - |
| `userStatus` | `integer` | No | User Status |

### Tag

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `integer` | No | - |
| `name` | `string` | No | - |

### Pet

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `integer` | No | - |
| `name` | `string` | Yes | - |
| `category` | `object` | No | - |
| `photoUrls` | `string`[] | Yes | - |
| `tags` | `object`[] | No | - |
| `status` | `"available"` \| `"pending"` \| `"sold"` | No | pet status in the store |

### ApiResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `integer` | No | - |
| `type` | `string` | No | - |
| `message` | `string` | No | - |
