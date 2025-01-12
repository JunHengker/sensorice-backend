import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "CUSTOMER"], {
  required_error: "Role cannot be empty",
  invalid_type_error: "Role must be one of 'ADMIN' or 'CUSTOMER'",
});

export type Role = z.infer<typeof roleSchema>;
