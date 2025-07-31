export {};

// Create a type for the roles
export type Roles = "admin" | "manager" | "user";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
