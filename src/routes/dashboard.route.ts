import { Router } from "express";
import { dashboard } from "@/controllers/dashboard.controller";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyJWT from "@/middlewares/verifyJWT.middleware";

const router = Router();
router.get("/", verifyJWT, verifyRole(["ADMIN"]), dashboard);
export default router;
