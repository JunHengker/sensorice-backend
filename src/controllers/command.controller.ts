import type { Request, Response } from "express";
import {
  success,
  notFound,
  internalServerError,
  validationError,
  parseZodError,
} from "@/utils/responses";

import db from "@/services/db";
import notification from "@/utils/notification";

import { commandSchema } from "@/models/command.model";

import mqtt from "mqtt";

// MQTT broker connection
const mqttClient = mqtt.connect("mqtt://broker.emqx.io");

// create command for device humidity, temperature, soil_moisture, motion, light_level, valve_status
export const publishCommand = async (req: Request, res: Response) => {
  try {
    const validateBody = commandSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    // check if the device exists
    const device = await db.sensoriceDevice.findUnique({
      where: { machineId: validateBody.data.machineId },
    });

    if (!device) {
      return notFound(res, "Device not found");
    }

    // Publish the command to the MQTT broker {"machine_id":"sensorice","humidity":43.70}
    const command = `${validateBody.data.machineId}#${validateBody.data.type}`;
    mqttClient.publish("/SensoRice/command", command);

    notification(
      "LOGS",
      `Command sent to device ${validateBody.data.machineId}: ${validateBody.data.type}`
    );
    // Send success response
    return success(res, "Command sent successfully to the device");
  } catch (err) {
    return internalServerError(res);
  }
};
