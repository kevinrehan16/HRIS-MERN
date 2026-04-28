/*
  Warnings:

  - You are about to alter the column `leaveCredits` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - A unique constraint covering the columns `[tinNo]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sssNo]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[philhealthNo]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pagibigNo]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `AttendanceCorrection_attendanceId_fkey` ON `attendancecorrection`;

-- DropIndex
DROP INDEX `AttendanceCorrection_employeeId_fkey` ON `attendancecorrection`;

-- DropIndex
DROP INDEX `Employee_departmentId_fkey` ON `employee`;

-- DropIndex
DROP INDEX `Employee_positionId_fkey` ON `employee`;

-- DropIndex
DROP INDEX `Employee_scheduleId_fkey` ON `employee`;

-- DropIndex
DROP INDEX `LeaveRequest_employeeId_fkey` ON `leaverequest`;

-- DropIndex
DROP INDEX `Payroll_employeeId_fkey` ON `payroll`;

-- DropIndex
DROP INDEX `Position_departmentId_fkey` ON `position`;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `birthDate` DATETIME(3) NULL,
    ADD COLUMN `civilStatus` ENUM('SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED') NULL DEFAULT 'SINGLE',
    ADD COLUMN `contactNo` VARCHAR(191) NULL,
    ADD COLUMN `dateHired` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dateResigned` DATETIME(3) NULL,
    ADD COLUMN `employmentType` ENUM('FULL_TIME', 'PART_TIME', 'PROJECT_BASED', 'INTERN') NOT NULL DEFAULT 'FULL_TIME',
    ADD COLUMN `extensionName` VARCHAR(191) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    ADD COLUMN `middleName` VARCHAR(191) NULL,
    ADD COLUMN `pagibigNo` VARCHAR(191) NULL,
    ADD COLUMN `philhealthNo` VARCHAR(191) NULL,
    ADD COLUMN `sssNo` VARCHAR(191) NULL,
    ADD COLUMN `tinNo` VARCHAR(191) NULL,
    MODIFY `leaveCredits` DOUBLE NOT NULL DEFAULT 15.0,
    MODIFY `basicSalary` DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
    MODIFY `allowance` DECIMAL(12, 2) NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE `Document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `employeeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Employee_tinNo_key` ON `Employee`(`tinNo`);

-- CreateIndex
CREATE UNIQUE INDEX `Employee_sssNo_key` ON `Employee`(`sssNo`);

-- CreateIndex
CREATE UNIQUE INDEX `Employee_philhealthNo_key` ON `Employee`(`philhealthNo`);

-- CreateIndex
CREATE UNIQUE INDEX `Employee_pagibigNo_key` ON `Employee`(`pagibigNo`);

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Position` ADD CONSTRAINT `Position_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payroll` ADD CONSTRAINT `Payroll_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceCorrection` ADD CONSTRAINT `AttendanceCorrection_attendanceId_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `Attendance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceCorrection` ADD CONSTRAINT `AttendanceCorrection_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
