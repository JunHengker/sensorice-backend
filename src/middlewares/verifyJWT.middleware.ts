import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { unauthorized } from "@/utils/responses";
import db from "@/services/db";
import ENV from "@/utils/env";
import type { JWTModel } from "@/models/auth/jwt.model";

/**
 * Middleware function to verify the JWT token in the request.
 * If the token is valid, it sets the user role and data in the request object.
 * If the token is invalid or expired, it returns an unauthorized response.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next function to call in the middleware chain.
 * @returns Promise<void>
 */
const verifyJwt = async (
  req: Request, // Adjusted to use User type from @prisma/client
  res: Response,
  next: NextFunction
) => {
  try {
    const jwtToken = req.cookies.jwt as string | undefined;

    if (!jwtToken) {
      return unauthorized(res, "Invalid session: JWT token missing");
    }

    const jwtData = jwt.verify(jwtToken, ENV.APP_JWT_SECRET) as JWTModel;

    const user = await db.user.findUnique({
      where: {
        username: jwtData.username,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return unauthorized(res, "Invalid session: User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return unauthorized(res, "JWT expired");
    } else if (err instanceof jwt.JsonWebTokenError) {
      return unauthorized(res, "JWT invalid");
    } else {
      return unauthorized(res, "JWT verification failed");
    }
  }
};

export default verifyJwt;
