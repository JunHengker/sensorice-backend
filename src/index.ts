import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import ENV from "@/utils/env";
import { badRequest, notFound } from "@/utils/responses";
import "@/controllers/mqtt.controller";

// [Route imports]
import indexRoute from "@/routes/index.route";
import authRoute from "@/routes/auth.route";
import dashboardRoute from "@/routes/dashboard.route";
import notificationRoute from "@/routes/notification.route";
import device from "@/routes/sensoriceDevice.route";
import command from "@/routes/command.route";

const app = express();

// [CORS]
const allowedOrigins = [
  "https://localhost:5173", // dev client
  //   "https://onlyjun.xyz", // testing
];

// [Global Middlewares]
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials to be sent with requests
  })
);
app.use(express.json());

// [Error handler untuk CORS]
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err) {
    return badRequest(res, err.message);
  }
  next();
});

// [Routes]
app.use(indexRoute);
app.use("/auth", authRoute);
app.use("/dashboard", dashboardRoute);
app.use("/notif", notificationRoute);
app.use("/device", device);
app.use("/command", command);

// [Global 404]
app.all("*", (_req: Request, res: Response) => {
  return notFound(res, "Route not found");
});

// // [Global Error Handling Middleware]
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.log("ERROR", err.message);
//   res.status(500).json({ error: err.message });
// });

// [Listener]
app.listen(ENV.APP_PORT, () => {
  console.log("INFO", `Server running on ${ENV.APP_API_URL}`);
});
