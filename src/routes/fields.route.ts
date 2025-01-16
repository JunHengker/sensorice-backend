import { Router } from "express";

import {
  createField,
  updateField,
  deleteField,
  getFields,
  getFieldByUserId,
  getFieldById,
} from "@/controllers/fields.controller";

import verifyJWT from "@/middlewares/verifyJWT.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";

const router = Router();

router.post(
  "/",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  createField
);
router.put(
  "/",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  updateField
);

router.delete(
  "/",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  deleteField
);

router.get(
  "/",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  getFields
);
router.post(
  "/byUser",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  getFieldByUserId
);

router.post(
  "/byId",
  // verifyJWT,
  // verifyRole(["ADMIN"]),
  getFieldById
);

export default router;
