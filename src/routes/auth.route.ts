import { Router } from "express";
import {
  createUser,
  createAdmin,
  login,
  refreshToken,
  logout,
  profile,
  updateUser,
  deleteUser,
  allUsers,
  getUser,
} from "@/controllers/auth.controller";
import verifyJWT from "@/middlewares/verifyJWT.middleware";
import verifyRole from "@/middlewares/verifyRole.middleware";

const router = Router();

router.post("/login", login);
router.post("/create", createUser);
router.post("/createAdmin", verifyJWT, verifyRole(["ADMIN"]), createAdmin);
router.get("/refresh", refreshToken);
router.delete("/logout", logout);
router.get("/profile", verifyJWT, profile);
router.put("/update", verifyJWT, updateUser);
router.delete("/delete", verifyJWT, deleteUser);
router.get("/allUsers", verifyJWT, verifyRole(["ADMIN"]), allUsers);
router.get("/getUser", verifyJWT, verifyRole(["ADMIN"]), getUser);

export default router;
