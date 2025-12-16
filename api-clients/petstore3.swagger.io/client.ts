// Auto-generated API client
// Do not edit manually

import type {
  AddPetResponse,
  AddPetRequest,
  UpdatePetResponse,
  UpdatePetRequest,
  FindPetsByStatusResponse,
  FindPetsByStatusParams,
  FindPetsByTagsResponse,
  FindPetsByTagsParams,
  GetPetByIdResponse,
  GetPetByIdParams,
  UpdatePetWithFormResponse,
  UpdatePetWithFormParams,
  DeletePetResponse,
  DeletePetParams,
  UploadFileResponse,
  UploadFileParams,
  UploadFileRequest,
  GetInventoryResponse,
  PlaceOrderResponse,
  PlaceOrderRequest,
  GetOrderByIdResponse,
  GetOrderByIdParams,
  DeleteOrderResponse,
  DeleteOrderParams,
  CreateUserResponse,
  CreateUserRequest,
  CreateUsersWithListInputResponse,
  CreateUsersWithListInputRequest,
  LoginUserResponse,
  LoginUserParams,
  LogoutUserResponse,
  GetUserByNameResponse,
  GetUserByNameParams,
  UpdateUserResponse,
  UpdateUserParams,
  UpdateUserRequest,
  DeleteUserResponse,
  DeleteUserParams
} from "./types.js";

export interface ClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export class Petstore3SwaggerIoClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.headers = config.headers || {};
  }

  pet = {
    /**
     * Add a new pet to the store.
     */
    addPet: async (body: AddPetRequest): Promise<AddPetResponse> => {
      const response = await fetch(this.baseUrl + "/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Update an existing pet.
     * Update an existing pet by Id.
     */
    updatePet: async (body: UpdatePetRequest): Promise<UpdatePetResponse> => {
      const response = await fetch(this.baseUrl + "/pet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Finds Pets by status.
     * Multiple status values can be provided with comma separated strings.
     */
    findPetsByStatus: async (params: FindPetsByStatusParams): Promise<FindPetsByStatusResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.set("status", String(params.status));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(this.baseUrl + "/pet/findByStatus" + queryString, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Finds Pets by tags.
     * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
     */
    findPetsByTags: async (params: FindPetsByTagsParams): Promise<FindPetsByTagsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.set("tags", String(params.tags));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(this.baseUrl + "/pet/findByTags" + queryString, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Find pet by ID.
     * Returns a single pet.
     */
    getPetById: async (params: GetPetByIdParams): Promise<GetPetByIdResponse> => {
      const response = await fetch(this.baseUrl + `/pet/${params.petId}`, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Updates a pet in the store with form data.
     * Updates a pet resource based on the form data.
     */
    updatePetWithForm: async (params: UpdatePetWithFormParams): Promise<UpdatePetWithFormResponse> => {
    const queryParams = new URLSearchParams();
    if (params.name !== undefined) queryParams.set("name", String(params.name));
    if (params.status !== undefined) queryParams.set("status", String(params.status));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(this.baseUrl + `/pet/${params.petId}` + queryString, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Deletes a pet.
     * Delete a pet.
     */
    deletePet: async (params: DeletePetParams): Promise<DeletePetResponse> => {
      const response = await fetch(this.baseUrl + `/pet/${params.petId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Uploads an image.
     * Upload image of the pet.
     */
    uploadFile: async (params: UploadFileParams, body: UploadFileRequest): Promise<UploadFileResponse> => {
    const queryParams = new URLSearchParams();
    if (params.additionalMetadata !== undefined) queryParams.set("additionalMetadata", String(params.additionalMetadata));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(this.baseUrl + `/pet/${params.petId}/uploadImage` + queryString, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  };

  store = {
    /**
     * Returns pet inventories by status.
     * Returns a map of status codes to quantities.
     */
    getInventory: async (): Promise<GetInventoryResponse> => {
      const response = await fetch(this.baseUrl + "/store/inventory", {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Place an order for a pet.
     * Place a new order in the store.
     */
    placeOrder: async (body: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
      const response = await fetch(this.baseUrl + "/store/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Find purchase order by ID.
     * For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
     */
    getOrderById: async (params: GetOrderByIdParams): Promise<GetOrderByIdResponse> => {
      const response = await fetch(this.baseUrl + `/store/order/${params.orderId}`, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Delete purchase order by identifier.
     * For valid response try integer IDs with value < 1000. Anything above 1000 or non-integers will generate API errors.
     */
    deleteOrder: async (params: DeleteOrderParams): Promise<DeleteOrderResponse> => {
      const response = await fetch(this.baseUrl + `/store/order/${params.orderId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  };

  user = {
    /**
     * Create user.
     * This can only be done by the logged in user.
     */
    createUser: async (body: CreateUserRequest): Promise<CreateUserResponse> => {
      const response = await fetch(this.baseUrl + "/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Creates list of users with given input array.
     */
    createUsersWithListInput: async (body: CreateUsersWithListInputRequest): Promise<CreateUsersWithListInputResponse> => {
      const response = await fetch(this.baseUrl + "/user/createWithList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Logs user into the system.
     * Log into the system.
     */
    loginUser: async (params?: LoginUserParams): Promise<LoginUserResponse> => {
    const queryParams = new URLSearchParams();
    if (params.username !== undefined) queryParams.set("username", String(params.username));
    if (params.password !== undefined) queryParams.set("password", String(params.password));
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(this.baseUrl + "/user/login" + queryString, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Logs out current logged in user session.
     * Log user out of the system.
     */
    logoutUser: async (): Promise<LogoutUserResponse> => {
      const response = await fetch(this.baseUrl + "/user/logout", {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Get user by user name.
     * Get user detail based on username.
     */
    getUserByName: async (params: GetUserByNameParams): Promise<GetUserByNameResponse> => {
      const response = await fetch(this.baseUrl + `/user/${params.username}`, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Update user resource.
     * This can only be done by the logged in user.
     */
    updateUser: async (params: UpdateUserParams, body: UpdateUserRequest): Promise<UpdateUserResponse> => {
      const response = await fetch(this.baseUrl + `/user/${params.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    /**
     * Delete user resource.
     * This can only be done by the logged in user.
     */
    deleteUser: async (params: DeleteUserParams): Promise<DeleteUserResponse> => {
      const response = await fetch(this.baseUrl + `/user/${params.username}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  };

}

/**
 * Create a new API client instance
 */
export function createPetstore3SwaggerIoClient(config: ClientConfig): Petstore3SwaggerIoClient {
  return new Petstore3SwaggerIoClient(config);
}
