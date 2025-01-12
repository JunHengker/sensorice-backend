import { z } from "zod";
export const commandSchema = z.object({
  machineId: z.string(),
  type: z.string(),
});

export type Command = z.infer<typeof commandSchema>;
