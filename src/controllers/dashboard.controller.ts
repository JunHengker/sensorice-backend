import type { Request, Response } from "express";
import { success } from "@/utils/responses";

export const dashboard = (_req: Request, res: Response) => {
  return success(res, "Welcome to ADMIN dashboard", {});
};
