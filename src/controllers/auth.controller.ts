import type { Request, Response } from "express";
import jwt, { verify } from "jsonwebtoken";
import db from "@/services/db";
import {
  internalServerError,
  success,
  notFound,
  validationError,
  parseZodError,
  unauthorized,
} from "@/utils/responses";
import ENV from "@/utils/env";

import bcrypt from "bcrypt";

import {
  userSchema,
  userUpdateableSchema,
  userloginSchema,
} from "@/models/accounts/user.model";
import type { JWTModel } from "@/models/auth/jwt.model";
import { idSchema } from "@/models/id.model";
import notification from "@/utils/notification";

const saltRounds = 10;

export const createUser = async (req: Request, res: Response) => {
  try {
    const validation = userSchema.safeParse(req.body);

    if (!validation.success) {
      return validationError(res, parseZodError(validation.error));
    }

    const validRoles = ["CUSTOMER"];
    if (!validRoles.includes(validation.data.role)) {
      return validationError(
        res,
        `Role must be one of ${validRoles.join(", ")}`
      );
    }

    const user = validation.data;

    const checkUsername = await db.user.findUnique({
      where: {
        username: user.username,
      },
    });

    if (checkUsername) {
      return validationError(res, "Username already exists");
    }

    const checkEmail = await db.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (checkEmail) {
      return validationError(res, "Email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const createUser = await db.user.create({
      data: {
        username: user.username,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    notification(
      "CREATE",
      `User "${req.body.username}" created a new account "${req.body.username}" with role "${req.body.role}"`
    );

    return success(
      res,
      `Username ${user.username} with role ${user.role} successfully created!`,
      createUser
    );
  } catch (err) {
    return internalServerError(res);
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const validation = userSchema.safeParse(req.body);

    if (!validation.success) {
      return validationError(res, parseZodError(validation.error));
    }

    const validRoles = ["ADMIN", "CUSTOMER"];
    if (!validRoles.includes(validation.data.role)) {
      return validationError(
        res,
        `Role must be one of ${validRoles.join(", ")}`
      );
    }

    const user = validation.data;

    const checkUsername = await db.user.findUnique({
      where: {
        username: user.username,
      },
    });

    if (checkUsername) {
      return validationError(res, "Username already exists");
    }

    const checkEmail = await db.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (checkEmail) {
      return validationError(res, "Email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const createUser = await db.user.create({
      data: {
        username: user.username,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    notification(
      "CREATE",
      `ADMIN "${req.user?.username}" created a new account "${req.body.username}" with role "${req.body.role}"`
    );

    return success(
      res,
      `Username ${user.username} with role ${user.role} successfully created!`,
      createUser
    );
  } catch (err) {
    return internalServerError(res);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validate = userloginSchema.safeParse(req.body);

    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const userLogin = validate.data;

    const user = await db.user.findUnique({
      where: {
        username: userLogin.username,
      },
    });

    if (!user) {
      return notFound(res, "Username not found");
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(
      userLogin.password,
      user.password
    );

    if (!isPasswordValid) {
      return validationError(res, "Password is incorrect");
    }

    const jwtToken = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      ENV.APP_JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    const jwtrefreshToken = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      ENV.APP_JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set up a cookie for JWT token
    res.cookie("jwt", jwtToken, {
      sameSite: "none",
      partitioned: true,
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      expires: new Date(Date.now() + 24 * 3600000),
    });

    // Set up a cookie for JWT refresh token
    res.cookie("jwt_refresh", jwtrefreshToken, {
      sameSite: "none",
      partitioned: true,
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      expires: new Date(Date.now() + 7 * 24 * 3600000),
    });

    notification("UPDATE", `ADMIN "${userLogin?.username}" Logged in"`);

    return success(res, `Login successful, welcome ${user.name}`, {
      user: {
        role: user.role,
        username: user.username,
      },
    });
  } catch (err) {
    return internalServerError(res);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    if (!req.cookies.jwt_refresh) {
      res.clearCookie("jwt", {
        sameSite: "none",
        partitioned: true,
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
      });
      res.clearCookie("jwt_refresh", {
        sameSite: "none",
        partitioned: true,
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
      });
      return unauthorized(res, "No refresh token found. Please login again");
    }

    const data = jwt.verify(
      req.cookies.jwt_refresh,
      ENV.APP_JWT_REFRESH_SECRET,
      {
        algorithms: ["HS256"],
      }
    ) as JWTModel;

    const user = await db.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (!user) {
      return notFound(res, "User not found");
    }

    const jwtToken = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      ENV.APP_JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Set up a cookie for JWT token
    res.cookie("jwt", jwtToken, {
      sameSite: "none",
      partitioned: true,
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      expires: new Date(Date.now() + 24 * 3600000),
    });

    return success(res, "Token refreshed", {
      user: {
        role: user.role,
        username: user.username,
      },
    });
  } catch (err) {
    return internalServerError(res);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("jwt", {
    sameSite: "none",
    partitioned: true,
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
  });

  res.clearCookie("jwt_refresh", {
    sameSite: "none",
    partitioned: true,
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
  });

  return success(res, "Logout successful");
};

export const profile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return unauthorized(res, "User not found");
    }

    return success(res, "User found", req.user);
  } catch (err) {
    return internalServerError(res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const validateBody = idSchema.safeParse(req.body);

    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const id = validateBody.data.id;

    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return notFound(res, "User not found");
    }

    await db.user.delete({
      where: {
        id,
      },
    });

    notification(
      "DELETE",
      `ADMIN "${req.user?.username}" deleted account "${user.username}" with role "${user.role}"`
    );

    return success(res, "User successfully deleted", user);
  } catch (err) {
    return internalServerError(res);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const validateBody = userUpdateableSchema.safeParse(req.body);

    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    // check user
    const isUserExist = await db.user.findUnique({
      where: {
        id: validateBody.data.id,
      },
    });

    if (!isUserExist) {
      return notFound(res, "User not found");
    }

    // check username if exists
    const isUsernameExist = await db.user.findUnique({
      where: {
        username: validateBody.data.username,
      },
    });

    const isEmailExist = await db.user.findUnique({
      where: {
        email: validateBody.data.email,
      },
    });

    if (isEmailExist && isEmailExist.id !== validateBody.data.id) {
      return validationError(res, "Email already exists");
    }

    if (isUsernameExist && isUsernameExist.id !== validateBody.data.id) {
      return validationError(res, "Username already exists");
    }

    if (validateBody.data.password === undefined) {
      const user = await db.user.update({
        where: {
          id: validateBody.data.id,
        },
        data: {
          username: validateBody.data.username,
          name: validateBody.data.name,
          email: validateBody.data.email,
          password: validateBody.data.password,
          role: validateBody.data.role,
        },
      });

      notification(
        "UPDATE",
        `ADMIN "${req.user?.username}" updated account "${req.body.username}" with role "${req.body.role}"`
      );

      return success(res, "User successfully updated", user);
    }

    const hashedPassword = await bcrypt.hash(
      validateBody.data.password,
      saltRounds
    );

    const user = await db.user.update({
      where: {
        id: validateBody.data.id,
      },
      data: {
        username: validateBody.data.username,
        name: validateBody.data.name,
        email: validateBody.data.email,
        password: hashedPassword,
        role: validateBody.data.role,
      },
    });

    notification(
      "UPDATE",
      `ADMIN "${req.user?.username}" updated account "${req.body.username}" with role "${req.body.role}"`
    );

    return success(res, "User successfully updated", user);
  } catch (err) {
    return internalServerError(res);
  }
};

export const allUsers = async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany();

    return success(res, "Users found", users);
  } catch (err) {
    return internalServerError(res);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const validateBody = idSchema.safeParse(req.body);

    if (!validateBody.success) {
      return validationError(res, parseZodError(validateBody.error));
    }

    const user = await db.user.findUnique({
      where: {
        id: validateBody.data.id,
      },
    });

    if (!user) {
      return notFound(res, "User not found");
    }

    return success(res, "User found", user);
  } catch (err) {
    return internalServerError(res);
  }
};
