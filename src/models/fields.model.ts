import { z } from "zod";

export const fieldSchema = z.object({
  id: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(), // for now
  name: z.string({ required_error: "Name cannot be empty" }).min(2).max(100),
  coordinate: z
    .string({ required_error: "Coordinate cannot be empty" })
    .min(2)
    .max(200),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const fieldUpdateableSchema = fieldSchema.pick({
  id: true,
  userId: true,
  name: true,
  coordinate: true,
  updatedAt: true,
});

export type Field = z.infer<typeof fieldSchema>;
export type FieldUpdateable = z.infer<typeof fieldUpdateableSchema>;
