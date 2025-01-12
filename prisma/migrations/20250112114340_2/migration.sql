/*
  Warnings:

  - The values [LIGHT] on the enum `SensorReading_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `sensorreading` MODIFY `type` ENUM('HUMIDITY', 'TEMPERATURE', 'LIGHT_LEVEL', 'SOIL_MOISTURE', 'MOTION') NOT NULL;
