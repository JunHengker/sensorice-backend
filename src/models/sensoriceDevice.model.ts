import { z } from "zod";

export const sensoriceDeviceSchema = z.object({
  id: z.number().int().positive().optional(),
  machineId: z.string(),
  location: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  userId: z.number().int().optional(), //for testing purposes
  sensoriceIrrigation: z.boolean().default(false),
});

export const sensoriceDeviceUpdateSchema = sensoriceDeviceSchema.pick({
  location: true,
  updatedAt: true,
  userId: true,
  sensoriceIrrigation: true,
});

export type SensoriceDevice = z.infer<typeof sensoriceDeviceSchema>;
export type SensoriceDeviceUpdate = z.infer<typeof sensoriceDeviceUpdateSchema>;
