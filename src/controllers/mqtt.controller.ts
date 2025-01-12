import db from "@/services/db";
import { SensorType } from "@prisma/client";
import mqtt from "mqtt";

const mqttClient = mqtt.connect("mqtt://broker.emqx.io");
mqttClient.on("connect", () => {
  console.log("[MQTT:INFO] Connected to MQTT broker");
  mqttClient.subscribe("/SensoRice/response", (err) => {
    if (err) {
      console.error("[MQTT:ERROR] Failed to subscribe to topic:", err);
    } else {
      console.log("[MQTT:INFO] Subscribed to /SensoRice/response");
    }
  });
});

// Manually generate Id, for cleaner database purposes
async function generateSensorId() {
  try {
    const products = await db.sensorReading.findMany();
    if (products.length === 0) {
      return 1;
    }
    const lastProduct = products[products.length - 1];
    return lastProduct.id + 1;
  } catch (err) {
    return null;
  }
}

mqttClient.on("message", async (topic, message) => {
  try {
    if (topic === "/SensoRice/response") {
      // Parse the incoming message
      const data = JSON.parse(message.toString());
      const {
        machine_id,
        humidity,
        temperature,
        soil_moisture,
        motion,
        light_level,
        valve_status,
      } = data;

      if (!machine_id) {
        console.error("[MQTT:ERROR] Missing machine_id in payload");
        return;
      }

      // Check if the device exists
      const device = await db.sensoriceDevice.findUnique({
        where: { machineId: machine_id },
      });

      if (!device) {
        console.error(
          `[MQTT:ERROR] Device with machine_id ${machine_id} not found`
        );
        return;
      }

      const sensorId = await generateSensorId();
      if (!sensorId) {
        console.error("[MQTT:ERROR] Failed to generate sensor ID");
        return;
      }

      // Map available sensor data to their respective types
      const sensorData = [
        { type: "HUMIDITY", value: humidity },
        { type: "TEMPERATURE", value: temperature },
        { type: "SOIL_MOISTURE", value: soil_moisture },
        { type: "MOTION", value: motion },
        { type: "LIGHT_LEVEL", value: light_level },
        { type: "VALVE_STATUS", value: valve_status },
      ].filter((sensor) => sensor.value !== undefined); // Filter out undefined values

      if (sensorData.length === 0) {
        console.error("[MQTT:ERROR] No valid sensor data found in the payload");
        return;
      }

      if (valve_status === "ON") {
        const updateValve = await db.sensoriceIrrigation.update({
          where: { machineId: machine_id },
          data: {
            pumpState: true,
          },
        });

        const sensorData = await db.sensorReading.create({
          data: {
            id: sensorId,
            machineId: machine_id,
            type: "VALVE_STATUS" as SensorType,
            value: valve_status.toString(),
          },
        });

        console.log("[MQTT:INFO] Valve is ON for machine_id: ", machine_id);
        return;
      } else if (valve_status === "OFF") {
        const updateValve = await db.sensoriceIrrigation.update({
          where: { machineId: machine_id },
          data: {
            pumpState: false,
          },
        });

        const sensorData = await db.sensorReading.create({
          data: {
            id: sensorId,
            machineId: machine_id,
            type: "VALVE_STATUS" as SensorType,
            value: valve_status.toString(),
          },
        });

        console.log("[MQTT:INFO] Valve is OFF for machine_id: ", machine_id);
        return;
      }

      // Generate IDs and save all valid sensor readings to the database
      const sensorReadings = await Promise.all(
        sensorData.map(async ({ type, value }) => {
          return db.sensorReading.create({
            data: {
              id: sensorId,
              machineId: machine_id,
              type: type as SensorType,
              value: value.toString(),
            },
          });
        })
      );

      console.log(
        `[MQTT:INFO] Saved ${
          sensorReadings.filter(Boolean).length
        } sensor readings for machine_id: ${machine_id}`
      );
    }
  } catch (err) {
    console.error("[MQTT:ERROR] Error processing message:", err);
  }
});
