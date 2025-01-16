-- DropForeignKey
ALTER TABLE `field` DROP FOREIGN KEY `field_userId_fkey`;

-- AlterTable
ALTER TABLE `field` MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `field` ADD CONSTRAINT `field_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
