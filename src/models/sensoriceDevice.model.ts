import { z } from "zod";

export const sensoriceDeviceSchema = z.object({
  id: z.number().int().positive().optional(),
  machineId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  userId: z.number().int().optional(), //for testing purposes
  sensoriceIrrigation: z.boolean().default(false),
  fieldId: z.number().int().positive().optional(), // for now
});

export const sensoriceDeviceIdSchema = z.object({
  machineId: z.string(),
});

export const sensoriceDeviceUpdateSchema = sensoriceDeviceSchema.pick({
  machineId: true,
  updatedAt: true,
  userId: true,
  sensoriceIrrigation: true,
  fieldId: true,
});

export type SensoriceDevice = z.infer<typeof sensoriceDeviceSchema>;
export type SensoriceDeviceUpdate = z.infer<typeof sensoriceDeviceUpdateSchema>;
export type SensoriceDeviceId = z.infer<typeof sensoriceDeviceIdSchema>;
