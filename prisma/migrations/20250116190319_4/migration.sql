-- AlterTable
ALTER TABLE `sensoricedevice` ADD COLUMN `fieldId` INTEGER NULL;

-- CreateTable
CREATE TABLE `field` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `coordinate` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `field` ADD CONSTRAINT `field_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SensoriceDevice` ADD CONSTRAINT `SensoriceDevice_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `field`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
