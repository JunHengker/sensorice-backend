import type { Request, Response, NextFunction } from "express";
import { forbidden } from "@/utils/responses";
import type { Role } from "@/models/accounts/role.model";

/**
 * Middleware factory to verify the role of the user.
 * @param role - The role to be verified. Can be one of "ADMIN" or "CUSTOMER".
 * @returns The middleware function that verifies the role of the user.
 */

const verifyRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return forbidden(res, "Role not allowed");
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole as "ADMIN" | "CUSTOMER")) {
      return forbidden(res, "Role not allowed");
    }

    next();
  };
};

export default verifyRole;
