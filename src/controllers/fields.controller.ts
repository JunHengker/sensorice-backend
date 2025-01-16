import type { Request, Response } from "express";
import {
  success,
  notFound,
  internalServerError,
  validationError,
  parseZodError,
} from "@/utils/responses";

import db from "@/services/db";
import notification from "@/utils/notification";
import { idSchema } from "@/models/id.model";

import { fieldSchema, fieldUpdateableSchema } from "@/models/fields.model";
// Manually generate Id, for cleaner database purposes
async function generateFieldId() {
  try {
    const products = await db.field.findMany();
    if (products.length === 0) {
      return 1;
    }
    const lastProduct = products[products.length - 1];
    return lastProduct.id + 1;
  } catch (err) {
    return null;
  }
}

export const getFields = async (req: Request, res: Response) => {
  try {
    const fields = await db.field.findMany();
    return success(res, "Fields fetched successfully", fields);
  } catch (err) {
    return internalServerError(res);
  }
};

export const getFieldById = async (req: Request, res: Response) => {
  try {
    const validateBody = idSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const fields = await db.field.findUnique({
      where: { id: validateBody.data.id },
      select: {
        id: true,
        name: true,
        coordinate: true,
      },
    });

    if (!fields) {
      return notFound(res, "Fields not found");
    }

    return success(res, "Fields fetched successfully", fields);
  } catch (err) {
    return internalServerError(res);
  }
};

export const getFieldByUserId = async (req: Request, res: Response) => {
  try {
    const validateBody = idSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const fields = await db.field.findMany({
      where: { userId: validateBody.data.id },
      select: {
        id: true,
        name: true,
        coordinate: true,
      },
    });

    if (!fields) {
      return notFound(res, "Fields not found");
    }

    return success(res, "Fields fetched successfully", fields);
  } catch (err) {
    return internalServerError(res);
  }
};

export const createField = async (req: Request, res: Response) => {
  try {
    const validateBody = fieldSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const fieldId = await generateFieldId();
    if (!fieldId) {
      return internalServerError(res);
    }

    const field = await db.field.create({
      data: {
        id: fieldId,
        name: validateBody.data.name,
        coordinate: validateBody.data.coordinate,
      },
    });

    return success(res, "Field created successfully", field);
  } catch (err) {
    return internalServerError(res);
  }
};

export const updateField = async (req: Request, res: Response) => {
  try {
    const validateBody = fieldUpdateableSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const field = await db.field.findUnique({
      where: { id: validateBody.data.id },
    });

    if (!field) {
      return notFound(res, "Field not found");
    }

    const updatedField = await db.field.update({
      where: { id: validateBody.data.id },
      data: {
        name: validateBody.data.name,
        coordinate: validateBody.data.coordinate,
        updatedAt: new Date(),
      },
    });

    return success(res, "Field updated successfully", updatedField);
  } catch (err) {
    return internalServerError(res);
  }
};

export const deleteField = async (req: Request, res: Response) => {
  try {
    const validateParams = idSchema.safeParse(req.params);
    if (!validateParams.success) {
      return validationError(res, parseZodError(validateParams.error));
    }

    const field = await db.field.findUnique({
      where: { id: validateParams.data.id },
    });

    if (!field) {
      return notFound(res, "Field not found");
    }

    await db.field.delete({ where: { id: validateParams.data.id } });

    return success(res, "Field deleted successfully");
  } catch (err) {
    return internalServerError(res);
  }
};
