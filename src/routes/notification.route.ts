import { Router } from "express";
import { getAllNotif } from "@/controllers/notification.controller";
import verifyRole from "@/middlewares/verifyRole.middleware";
import verifyJWT from "@/middlewares/verifyJWT.middleware";

const router = Router();
router.get("/", verifyJWT, verifyRole(["ADMIN"]), getAllNotif);
export default router;
