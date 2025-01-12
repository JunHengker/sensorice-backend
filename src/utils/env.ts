import notification from "@/utils/notification";

if (!process.env.APP_PORT) {
  notification("WARN", "APP_PORT not set, using default 8080");
}

if (!process.env.APP_JWT_SECRET) {
  notification("ERROR", "APP_JWT_SECRET not set in .env");
  process.exit(-1);
}

if (!process.env.APP_JWT_REFRESH_SECRET) {
  notification("ERROR", "APP_JWT_REFRESH_SECRET not set in .env");
  process.exit(-1);
}

if (!process.env.APP_DB_URL) {
  notification("ERROR", "APP_DB_URL not set in .env");
  process.exit(-1);
}

if (!process.env.APP_API_URL) {
  notification(
    "WARN",
    "APP_API_URL not set, using default http://localhost:8080"
  );
}

if (!process.env.APP_FRONTEND_URL) {
  notification(
    "WARN",
    "APP_FRONTEND_URL not set, using default http://localhost:5173"
  );
}

const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_PORT: Number(process.env.APP_PORT) || 8080,
  APP_JWT_SECRET: process.env.APP_JWT_SECRET || "sensoriceSecret",
  APP_JWT_REFRESH_SECRET:
    process.env.APP_JWT_REFRESH_SECRET || "sensoriceRefreshSecret",
  APP_DB_URL: process.env.APP_DB_URL || "mysql://root@localhost:3306/sensorice",
  APP_API_URL: process.env.APP_API_URL || "http://localhost:8080",
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL || "http://localhost:5173",
};

export default ENV;
