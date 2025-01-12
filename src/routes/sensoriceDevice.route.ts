import { Router } from "express";

import {
  createSensoriceDevice,
  updateSensoriceDevice,
  deleteSensoriceDevice,
  getAllSensoriceDevices,
  getSensoriceDevice,
  getAllIrrigationProducts,
  getIrrigationProduct,
  getUserProducts,
  getUserProduct,
} from "@/controllers/sensoriceDevice.controller";

import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyJWT from "@/middlewares/verifyJWT.middleware";

const router = Router();
router.post(
  "/",
  // verifyJWT,
  // verifyRole(["ADMIN", "CUSTOMER"]),
  createSensoriceDevice
);
router.put(
  "/",
  // verifyJWT,
  // verifyRole(["ADMIN", "CUSTOMER"]),
  updateSensoriceDevice
);
router.delete(
  "/",
  // verifyJWT,
  // verifyRole(["ADMIN", "CUSTOMER"]),
  deleteSensoriceDevice
);
router.get(
  "/",
  //  verifyJWT,
  //  verifyRole(["ADMIN"]),
  getAllSensoriceDevices
);
router.get(
  "/byId",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  getSensoriceDevice
);

router.get(
  "/irrigation",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  getAllIrrigationProducts
);

router.get(
  "/irrigation/byId",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  getIrrigationProduct
);

router.get(
  "/user",
  // verifyJWT,
  // verifyRole(["ADMIN", "CUSTOMER"]),
  getUserProducts
);
router.get(
  "/user/byId",
  // verifyJWT,
  // verifyRole(["ADMIN", "CUSTOMER"]),
  getUserProduct
);

export default router;
