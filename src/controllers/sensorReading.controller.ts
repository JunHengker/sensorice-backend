import type { Request, Response } from "express";
import {
  success,
  notFound,
  internalServerError,
  validationError,
  parseZodError,
} from "@/utils/responses";

import db from "@/services/db";

import { sensorReadingSchema } from "@/models/sensorReading.model";
import { SensorType } from "@prisma/client";

export const getSensorReadings = async (req: Request, res: Response) => {
  try {
    const sensorReadings = await db.sensorReading.findMany();
    return success(res, "Sensor readings fetched successfully", sensorReadings);
  } catch (err) {
    return internalServerError(res);
  }
};

export const getSensorReadingByMachineId = async (
  req: Request,
  res: Response
) => {
  try {
    const ValidateParams = sensorReadingSchema.safeParse(req.params);
    if (!ValidateParams.success) {
      return validationError(res, parseZodError(ValidateParams.error));
    }

    const isMachineIdExist = await db.sensoriceDevice.findUnique({
      where: { machineId: ValidateParams.data.machineId },
    });

    if (!isMachineIdExist) {
      return notFound(res, "Machine ID not found");
    }

    const sensorReading = await db.sensorReading.findMany({
      where: { machineId: ValidateParams.data.machineId },
    });

    // order by the newest timestamp and max 1 month
    sensorReading.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return success(res, "Sensor reading fetched successfully", sensorReading);
  } catch (err) {
    return internalServerError(res);
  }
};

// Get the newest sensor reading by machine ID and type

export const getNewestSensorReadingByMachineId = async (
  req: Request,
  res: Response
) => {
  try {
    const ValidateParams = sensorReadingSchema.safeParse(req.params);
    if (!ValidateParams.success) {
      return validationError(res, parseZodError(ValidateParams.error));
    }

    const isMachineIdExist = await db.sensoriceDevice.findUnique({
      where: { machineId: ValidateParams.data.machineId },
    });

    if (!isMachineIdExist) {
      return notFound(res, "Machine ID not found");
    }

    const sensorReading = await db.sensorReading.findMany({
      where: { machineId: ValidateParams.data.machineId },
      distinct: ["type"],
      orderBy: { timestamp: "desc" },
    });

    return success(res, "Sensor reading fetched successfully", sensorReading);
  } catch (err) {
    return internalServerError(res);
  }
};
