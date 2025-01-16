import { Router } from "express";
import {
  getSensorReadings,
  getSensorReadingByMachineId,
  getNewestSensorReadingByMachineId,
} from "@/controllers/sensorReading.controller";

import verifyJwt from "@/middlewares/verifyJWT.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";

const router = Router();
router.get(
  "/",
  // verifyJwt,
  // verifyRole(["ADMIN"]),
  getSensorReadings
);
router.get("/:machineId", getSensorReadingByMachineId);
router.get("/newest/:machineId", getNewestSensorReadingByMachineId);

export default router;
