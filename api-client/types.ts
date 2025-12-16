// Auto-generated TypeScript types
// Do not edit manually

// ============ Schemas ============

export interface Order {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  /** Order Status */
  status?: "placed" | "approved" | "delivered";
  complete?: boolean;
}

export interface Category {
  id?: number;
  name?: string;
}

export interface User {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
}

export interface Tag {
  id?: number;
  name?: string;
}

export interface Pet {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
}

export interface ApiResponse {
  code?: number;
  type?: string;
  message?: string;
}

// ============ Operation Types ============

export interface AddPetRequest {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
}

export type AddPetResponse = {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
};

export interface UpdatePetRequest {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
}

export type UpdatePetResponse = {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
};

export interface FindPetsByStatusParams {
  /** Status values that need to be considered for filter */
  status: string;
}

export type FindPetsByStatusResponse = {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
}[];

export interface FindPetsByTagsParams {
  /** Tags to filter by */
  tags: string[];
}

export type FindPetsByTagsResponse = {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
}[];

export interface GetPetByIdParams {
  /** ID of pet to return */
  petId: number;
}

export type GetPetByIdResponse = {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
};

export interface UpdatePetWithFormParams {
  /** ID of pet that needs to be updated */
  petId: number;
  /** Name of pet that needs to be updated */
  name?: string;
  /** Status of pet that needs to be updated */
  status?: string;
}

export type UpdatePetWithFormResponse = {
  id?: number;
  name: string;
  category?: {
    id?: number;
    name?: string;
  };
  photoUrls: string[];
  tags?: {
    id?: number;
    name?: string;
  }[];
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
};

export interface DeletePetParams {
  /** Pet id to delete */
  petId: number;
}

export type DeletePetResponse = void;

export interface UploadFileParams {
  /** ID of pet to update */
  petId: number;
  /** Additional Metadata */
  additionalMetadata?: string;
}

export type UploadFileRequest = Blob;

export type UploadFileResponse = {
  code?: number;
  type?: string;
  message?: string;
};

export type GetInventoryResponse = Record<string, unknown>;

export interface PlaceOrderRequest {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  /** Order Status */
  status?: "placed" | "approved" | "delivered";
  complete?: boolean;
}

export type PlaceOrderResponse = {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  /** Order Status */
  status?: "placed" | "approved" | "delivered";
  complete?: boolean;
};

export interface GetOrderByIdParams {
  /** ID of order that needs to be fetched */
  orderId: number;
}

export type GetOrderByIdResponse = {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  /** Order Status */
  status?: "placed" | "approved" | "delivered";
  complete?: boolean;
};

export interface DeleteOrderParams {
  /** ID of the order that needs to be deleted */
  orderId: number;
}

export type DeleteOrderResponse = void;

export interface CreateUserRequest {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
}

export type CreateUserResponse = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
};

export type CreateUsersWithListInputRequest = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
}[];

export type CreateUsersWithListInputResponse = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
};

export interface LoginUserParams {
  /** The user name for login */
  username?: string;
  /** The password for login in clear text */
  password?: string;
}

export type LoginUserResponse = string;

export type LogoutUserResponse = void;

export interface GetUserByNameParams {
  /** The name that needs to be fetched. Use user1 for testing */
  username: string;
}

export type GetUserByNameResponse = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
};

export interface UpdateUserParams {
  /** name that need to be deleted */
  username: string;
}

export interface UpdateUserRequest {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
}

export type UpdateUserResponse = void;

export interface DeleteUserParams {
  /** The name that needs to be deleted */
  username: string;
}

export type DeleteUserResponse = void;
