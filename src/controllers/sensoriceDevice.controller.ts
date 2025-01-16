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

import {
  sensoriceDeviceIdSchema,
  sensoriceDeviceSchema,
  sensoriceDeviceUpdateSchema,
} from "@/models/sensoriceDevice.model";

// Manually generate Id, for cleaner database purposes
async function generateSensoriceId() {
  try {
    const products = await db.sensoriceDevice.findMany();
    if (products.length === 0) {
      return 1;
    }
    const lastProduct = products[products.length - 1];
    return lastProduct.id + 1;
  } catch (err) {
    return null;
  }
}

async function generateIrrigationId() {
  try {
    const products = await db.sensoriceIrrigation.findMany();
    if (products.length === 0) {
      return 1;
    }
    const lastProduct = products[products.length - 1];
    return lastProduct.id + 1;
  } catch (err) {
    return null;
  }
}

// Create product
export const createSensoriceDevice = async (req: Request, res: Response) => {
  try {
    const validateBody = sensoriceDeviceSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    // Generate product ID
    const productId = await generateSensoriceId();
    if (!productId) {
      return internalServerError(res);
    }

    // is location exist?

    const isLocationExist = await db.field.findUnique({
      where: {
        // mount to userid for production
        id: validateBody.data.fieldId,
      },
    });

    if (!isLocationExist) {
      return notFound(res, "Field not found");
    }

    // check machineId
    const isMachineExist = await db.sensoriceDevice.findUnique({
      where: {
        machineId: validateBody.data.machineId,
      },
    });

    if (isMachineExist) {
      return notFound(res, "Machine already exist");
    }

    // Create product
    const product = await db.sensoriceDevice.create({
      data: {
        id: productId,
        machineId: req.body.machineId,
        fieldId: validateBody.data.fieldId,
        userId: req.user?.id,
      },
    });

    // Check if product is irrigation
    if (validateBody.data.sensoriceIrrigation === true) {
      const irrigationId = await generateIrrigationId();
      if (!irrigationId) {
        return internalServerError(res);
      }

      const irrigation = await db.sensoriceIrrigation.create({
        data: {
          id: irrigationId,
          machineId: product.machineId,
          pumpState: false,
        },
      });

      notification(
        "CREATE",
        `"${req.user?.role}" "${req.user?.username}" created a new irrigation product "${req.body.machineId}"`
      );

      return success(
        res,
        "Irrigation product successfully created",
        irrigation
      );
    }

    notification(
      "CREATE",
      `"${req.user?.role}" "${req.user?.username}" created a new product "${req.body.machineId}"`
    );

    return success(res, "Product successfully created", product);
  } catch (err) {
    internalServerError(res);
  }
};

// Update product
export const updateSensoriceDevice = async (req: Request, res: Response) => {
  try {
    const validateBody = sensoriceDeviceUpdateSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const product = await db.sensoriceDevice.findUnique({
      where: {
        machineId: validateBody.data.machineId,
      },
    });

    if (!product) {
      return notFound(res, "Product not found");
    }

    const updatedProduct = await db.sensoriceDevice.update({
      where: {
        machineId: req.body.machineId,
      },
      data: {
        fieldId: validateBody.data.fieldId,
        updatedAt: new Date(),
        // userId: req.user?.id,
      },
    });

    notification(
      "UPDATE",
      `"${req.user?.role}" "${req.user?.username}" updated product "${req.body.machineId}"`
    );

    return success(res, "Product successfully updated", updatedProduct);
  } catch (err) {
    internalServerError(res);
  }
};

// Delete product
export const deleteSensoriceDevice = async (req: Request, res: Response) => {
  try {
    const validateBody = sensoriceDeviceSchema.safeParse(req.body.machineId);

    const product = await db.sensoriceDevice.findUnique({
      where: {
        machineId: req.body.machineId,
      },
    });

    if (!product) {
      return notFound(res, "Product not found");
    }

    await db.sensoriceDevice.delete({
      where: {
        machineId: req.body.machineId,
      },
    });

    // Check if product is irrigation
    const irrigation = await db.sensoriceIrrigation.findUnique({
      where: {
        machineId: req.body.machineId,
      },
    });

    if (irrigation) {
      await db.sensoriceIrrigation.delete({
        where: {
          machineId: req.body.machineId,
        },
      });
    }

    notification(
      "DELETE",
      `"${req.user?.role}" "${req.user?.username}" deleted product "${product.machineId}"`
    );

    return success(res, "Product successfully deleted");
  } catch (err) {
    internalServerError(res);
  }
};

// Get all products
export const getAllSensoriceDevices = async (req: Request, res: Response) => {
  try {
    const products = await db.sensoriceDevice.findMany();
    return success(res, "All products", products);
  } catch (err) {
    internalServerError(res);
  }
};

// Get product by ID
export const getSensoriceDevice = async (req: Request, res: Response) => {
  try {
    const validateBody = sensoriceDeviceIdSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const product = await db.sensoriceDevice.findUnique({
      where: {
        machineId: req.body.machineId,
      },
      select: {
        id: true,
        machineId: true,
        fieldId: true,
      },
    });

    if (!product) {
      return notFound(res, "Product not found");
    }

    return success(res, "Product", product);
  } catch (err) {
    internalServerError(res);
  }
};

// Get all irrigation products
export const getAllIrrigationProducts = async (req: Request, res: Response) => {
  try {
    const products = await db.sensoriceIrrigation.findMany();
    return success(res, "All irrigation products", products);
  } catch (err) {
    internalServerError(res);
  }
};

// Get irrigation product by ID
export const getIrrigationProduct = async (req: Request, res: Response) => {
  try {
    const validateBody = sensoriceDeviceIdSchema.safeParse(req.body.machineId);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const product = await db.sensoriceIrrigation.findUnique({
      where: {
        machineId: req.body.machineId,
      },
      select: {
        id: true,
        machineId: true,
        pumpState: true,
      },
    });

    if (!product) {
      return notFound(res, "Product not found");
    }

    return success(res, "Irrigation product", product);
  } catch (err) {
    internalServerError(res);
  }
};

// Get user only products
export const getUserProducts = async (req: Request, res: Response) => {
  try {
    const products = await db.sensoriceDevice.findMany({
      where: {
        userId: req.user?.id,
      },
    });

    return success(res, "User products", products);
  } catch (err) {
    internalServerError(res);
  }
};

// Get user product by id
export const getUserProduct = async (req: Request, res: Response) => {
  try {
    const validateBody = idSchema.safeParse(req.body);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    // check if user is owner of the product
    const product = await db.sensoriceDevice.findUnique({
      where: {
        id: validateBody.data.id,
        userId: req.user?.id,
      },
      select: {
        id: true,
        machineId: true,
        fieldId: true,
      },
    });

    if (!product) {
      return notFound(res, "Product not found");
    }

    return success(res, "User product", product);
  } catch (err) {
    internalServerError(res);
  }
};

// Get product by field ID
export const getProductsByFieldId = async (req: Request, res: Response) => {
  try {
    const validateBody = sensoriceDeviceSchema.safeParse(req.body.fieldId);
    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const products = await db.sensoriceDevice.findMany({
      where: {
        fieldId: req.body.fieldId,
        // userId: req.user?.id,
      },
    });

    return success(res, "Products by field ID", products);
  } catch (err) {
    internalServerError(res);
  }
};
