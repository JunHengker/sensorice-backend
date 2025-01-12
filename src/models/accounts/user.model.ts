import { z } from "zod";

export const userSchema = z.object({
  id: z.number().int().positive().optional(),
  username: z
    .string({ required_error: "Username cannot be empty" })
    .min(2)
    .max(20),
  name: z.string({ required_error: "Name cannot be empty" }).min(2).max(30),
  email: z
    .string({ required_error: "Email cannot be empty" })
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password cannot be empty" })
    .min(4)
    .max(20),
  role: z.enum(["ADMIN", "CUSTOMER"]).default("CUSTOMER"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const userUpdateableSchema = userSchema
  .pick({
    id: true,
    username: true,
    name: true,
    email: true,
    password: true,
    role: true,
    updatedAt: true,
  })
  .extend({
    password: z.string().min(4).max(20).optional(),
  });

export const userloginSchema = z.object({
  username: z.string({ required_error: "Username cannot be empty" }),
  password: z.string({ required_error: "Password cannot be empty" }),
});

export type User = z.infer<typeof userSchema>;
export type UserUpdateable = z.infer<typeof userUpdateableSchema>;
export type UserLogin = z.infer<typeof userloginSchema>;
