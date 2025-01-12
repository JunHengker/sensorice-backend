import type { Request, Response } from "express";
import db from "@/services/db";
import { internalServerError, success } from "@/utils/responses";

export const getAllNotif = async (req: Request, res: Response) => {
  try {
    const response = await db.notification.findMany({
      where: {
        timestamp: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Notifications from the last 24 hours
        },
      },
    });

    return success(res, "Notification fetched successfully", response);
  } catch (err) {
    internalServerError(res);
  }
};
