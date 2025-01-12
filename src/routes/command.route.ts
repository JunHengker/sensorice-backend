import { Router } from "express";
import { publishCommand } from "@/controllers/command.controller";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyJWT from "@/middlewares/verifyJWT.middleware";

const router = Router();
router.post(
  "/",
  // verifyJWT,
  //  verifyRole(["ADMIN"]),
  publishCommand
);
export default router;
