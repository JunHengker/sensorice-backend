import { z } from "zod";

export const sensorReadingSchema = z.object({
  machineId: z.string(),
  type: z.string().optional(),
});

export type SensorReading = z.infer<typeof sensorReadingSchema>;
