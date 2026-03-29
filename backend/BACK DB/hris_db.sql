/*
SQLyog Ultimate v11.33 (64 bit)
MySQL - 5.6.51 : Database - hris_db
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`hris_db` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `hris_db`;

/*Table structure for table `_prisma_migrations` */

DROP TABLE IF EXISTS `_prisma_migrations`;

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `_prisma_migrations` */

insert  into `_prisma_migrations`(`id`,`checksum`,`finished_at`,`migration_name`,`logs`,`rolled_back_at`,`started_at`,`applied_steps_count`) values ('2e8cfc35-9897-46e2-98d8-6e7bc4ceebe2','ac7e7812b56a96bc88373ba652e383ed4c5b04d6a3d76babe9e72d9422b31291','2026-03-29 08:47:04.734','20260329072448_add_position_and_status',NULL,NULL,'2026-03-29 08:47:04.693',1),('7fa90af9-27e3-42d5-a612-e189e56acd7a','9ff579a598eefd033c9488c189cfe18530d4d06288de6ac2234c6b1517fa6b83','2026-03-29 08:47:04.785','20260329072745_initial_hris_structure',NULL,NULL,'2026-03-29 08:47:04.735',1),('6aeb3b19-e962-4eaf-9105-ed08626d72c8','25404f1cae46be1df19b64edd2b60231cfb74fa3949cdbbad8dcc663593e68a9','2026-03-29 08:47:04.843','20260329084309_add_roles_to_employee',NULL,NULL,'2026-03-29 08:47:04.785',1),('25028952-9a39-4795-b868-e53f190ab404','27bda28b7ae8c4ec65de9ce0e430fcc48b981d8427de558018990e9a4edce071','2026-03-29 09:19:52.861','20260329091952_add_attendance_table',NULL,NULL,'2026-03-29 09:19:52.784',1),('a952c6fb-f835-4769-a397-66fa90581204','4a4bff86a560d4958b88e0affe4d44f84c35d3eed42bac38f7b81f6e729ba2cc','2026-03-29 09:47:50.781','20260329094750_add_schedules',NULL,NULL,'2026-03-29 09:47:50.699',1),('b213905a-0fb1-46c5-9d2d-42cd6e539edb','34ab10649d62bb3af96e54617b0f1173f5fa09605590bcd5fecc926f632e75f9','2026-03-29 12:02:06.102','20260329120205_add_leave_system',NULL,NULL,'2026-03-29 12:02:05.982',1),('bda9a46c-eaf6-49e7-b537-a41e3aea812a','b1e920915be941837eb021ee58c24cfe0fac9dea49372a9ab8c509fd4a390ce0','2026-03-29 12:29:50.983','20260329122950_add_leave_credits',NULL,NULL,'2026-03-29 12:29:50.832',1),('a086eecf-57a9-42ef-98e0-6b7ddf4ea116','234e54062353e9b11bf0e655ff53742c7d55e51e67430524d4299667400d09e5','2026-03-29 14:08:00.936','20260329140800_add_payroll_and_salary',NULL,NULL,'2026-03-29 14:08:00.771',1);

/*Table structure for table `attendance` */

DROP TABLE IF EXISTS `attendance`;

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `timeIn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `timeOut` datetime(3) DEFAULT NULL,
  `status` enum('PRESENT','LATE','ABSENT','ON_LEAVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRESENT',
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employeeId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Attendance_employeeId_date_key` (`employeeId`,`date`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `attendance` */

insert  into `attendance`(`id`,`date`,`timeIn`,`timeOut`,`status`,`remarks`,`employeeId`) values (1,'2026-06-01 08:00:00.000','2026-06-01 08:00:00.000','2026-06-01 17:00:00.000','PRESENT',NULL,1),(2,'2026-06-01 08:00:00.000','2026-06-01 08:36:49.000','2026-06-01 17:00:00.000','LATE','Late (No schedule assigned)',2),(3,'2026-06-02 08:00:00.000','2026-06-02 08:00:00.000','2026-06-02 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(4,'2026-06-03 08:00:00.000','2026-06-03 08:00:00.000','2026-06-03 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(5,'2026-06-04 08:00:00.000','2026-06-04 08:00:00.000','2026-06-03 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(6,'2026-06-05 08:00:00.000','2026-06-05 08:00:00.000','2026-06-05 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(7,'2026-06-06 08:00:00.000','2026-06-06 10:36:49.000','2026-06-06 17:00:00.000','LATE','Late (No schedule assigned)',1),(8,'2026-06-07 08:00:00.000','2026-06-07 08:00:00.000','2026-06-07 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(9,'2026-06-08 08:00:00.000','2026-06-08 08:00:00.000','2026-06-08 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(10,'2026-06-09 08:00:00.000','2026-06-09 08:00:00.000','2026-06-09 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(11,'2026-06-10 08:00:00.000','2026-06-10 08:00:00.000','2026-06-10 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(12,'2026-06-11 08:00:00.000','2026-06-11 08:00:00.000','2026-06-11 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(13,'2026-06-12 08:00:00.000','2026-06-12 08:00:00.000','2026-06-12 17:00:00.000','PRESENT','Late (No schedule assigned)',2),(14,'2026-06-13 08:00:00.000','2026-06-13 08:00:00.000','2026-06-13 19:00:00.000','PRESENT','Late (No schedule assigned)',2),(15,'2026-06-14 08:00:00.000','2026-06-14 08:00:00.000','2026-06-14 17:00:00.000','PRESENT','Late (No schedule assigned)',1),(16,'2026-06-15 08:00:00.000','2026-06-15 08:00:00.000','2026-06-15 17:00:00.000','PRESENT','Late (No schedule assigned)',2);

/*Table structure for table `department` */

DROP TABLE IF EXISTS `department`;

CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_name_key` (`name`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `department` */

insert  into `department`(`id`,`name`) values (1,'IT Department'),(2,'Human Resources'),(3,'Accounting'),(4,'IT');

/*Table structure for table `employee` */

DROP TABLE IF EXISTS `employee`;

CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` int(11) DEFAULT NULL,
  `positionId` int(11) DEFAULT NULL,
  `status` enum('REGULAR','PROBATIONARY','CONTRACTUAL','TERMINATED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROBATIONARY',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `role` enum('ADMIN','EMPLOYEE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EMPLOYEE',
  `scheduleId` int(11) DEFAULT NULL,
  `leaveCredits` int(11) NOT NULL DEFAULT '15',
  `basicSalary` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Employee_employeeId_key` (`employeeId`),
  UNIQUE KEY `Employee_email_key` (`email`),
  KEY `Employee_departmentId_fkey` (`departmentId`),
  KEY `Employee_positionId_fkey` (`positionId`),
  KEY `Employee_scheduleId_fkey` (`scheduleId`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `employee` */

insert  into `employee`(`id`,`employeeId`,`firstName`,`lastName`,`email`,`password`,`departmentId`,`positionId`,`status`,`createdAt`,`updatedAt`,`role`,`scheduleId`,`leaveCredits`,`basicSalary`) values (1,'EMP-2026-001','Kevin','Macandog','kevin@hris.com','$2b$12$y1vA1EbkLfbz80v3g1x5x.kWutzgD8W3Dzk3qg85YjRjUwVR1Igi.',4,1,'PROBATIONARY','2026-03-29 09:01:49.436','2026-03-29 14:12:15.465','ADMIN',NULL,15,150000),(2,'EMP-2026-002','Admin','Password kevin123','admin@hris.com','$2b$12$y1vA1EbkLfbz80v3g1x5x.kWutzgD8W3Dzk3qg85YjRjUwVR1Igi.',3,3,'PROBATIONARY','2026-03-29 09:04:04.455','2026-03-29 14:23:15.500','EMPLOYEE',NULL,15,60000),(3,'EMP-2026-003','Andrea','Estrella','andi@hris.com','$2b$12$hgcvaKBsYThffCFEUK7fS.QnvQ/wmVqog0SwuAtlAdYCHCFRiJhem',NULL,NULL,'PROBATIONARY','2026-03-29 12:48:49.355','2026-03-29 14:12:15.465','EMPLOYEE',NULL,15,35000),(4,'EMP-2026-004','Ivy Nicole','De Guzman','ivy@hris.com','$2b$12$bnmdRP4G5Qybixf9OYMx9OcgYhrc1dIZHtw10y7KR0NFFtO2Onqby',NULL,NULL,'PROBATIONARY','2026-03-29 12:49:25.755','2026-03-29 14:12:15.465','EMPLOYEE',NULL,15,26500);

/*Table structure for table `leaverequest` */

DROP TABLE IF EXISTS `leaverequest`;

CREATE TABLE `leaverequest` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `type` enum('SICK','VACATION','EMERGENCY','MATERNITY','PATERNITY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `adminRemarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employeeId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `LeaveRequest_employeeId_fkey` (`employeeId`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `leaverequest` */

insert  into `leaverequest`(`id`,`startDate`,`endDate`,`type`,`reason`,`status`,`adminRemarks`,`employeeId`,`createdAt`,`updatedAt`) values (1,'2026-04-10 08:00:00.000','2026-04-12 17:00:00.000','VACATION','Magbabakasyon po sa Boracay kasama ang family. Need to recharge! ?','APPROVED','Approved. Enjoy your break!',1,'2026-03-29 12:15:47.024','2026-03-29 12:23:27.153'),(2,'2026-04-08 08:00:00.000','2026-04-12 17:00:00.000','EMERGENCY','Need mag part time sa Megamall.','REJECTED','You are bonded in this company.',1,'2026-03-29 12:54:18.432','2026-03-29 12:56:04.215'),(3,'2026-05-08 08:00:00.000','2026-05-12 17:00:00.000','MATERNITY','I am pregnant for almost 6 months.','PENDING',NULL,1,'2026-03-29 12:58:00.951','2026-03-29 12:58:00.951'),(4,'2026-06-18 08:00:00.000','2026-06-22 17:00:00.000','SICK','Heart broken.','PENDING',NULL,1,'2026-03-29 12:58:55.637','2026-03-29 12:58:55.637'),(5,'2026-06-18 08:00:00.000','2026-06-18 17:00:00.000','PATERNITY','My wife will deliver a baby.','APPROVED','Okay, congratulations!',2,'2026-03-29 13:12:42.548','2026-03-29 13:30:04.931'),(6,'2026-06-18 08:00:00.000','2026-06-18 17:00:00.000','EMERGENCY','I am sick, this coming month.','PENDING',NULL,2,'2026-03-29 13:13:31.130','2026-03-29 13:22:39.290');

/*Table structure for table `payroll` */

DROP TABLE IF EXISTS `payroll`;

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` int(11) NOT NULL,
  `periodStart` datetime(3) NOT NULL,
  `periodEnd` datetime(3) NOT NULL,
  `basicPay` double NOT NULL,
  `overtimePay` double NOT NULL DEFAULT '0',
  `absentDeduction` double NOT NULL DEFAULT '0',
  `lateDeduction` double NOT NULL DEFAULT '0',
  `sss` double NOT NULL DEFAULT '0',
  `philhealth` double NOT NULL DEFAULT '0',
  `pagibig` double NOT NULL DEFAULT '0',
  `tax` double NOT NULL DEFAULT '0',
  `netPay` double NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Payroll_employeeId_fkey` (`employeeId`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `payroll` */

insert  into `payroll`(`id`,`employeeId`,`periodStart`,`periodEnd`,`basicPay`,`overtimePay`,`absentDeduction`,`lateDeduction`,`sss`,`philhealth`,`pagibig`,`tax`,`netPay`,`status`,`createdAt`) values (1,1,'2026-06-01 00:00:00.000','2026-06-15 23:59:59.999',75000,0,54545.45454545454,2215.909090909091,250,1875,50,0,16063.63636363637,'PENDING','2026-03-29 16:07:17.552'),(2,2,'2026-06-01 00:00:00.000','2026-06-15 23:59:59.999',30000,852.2727272727274,0,204.5454545454546,250,750,50,0,29597.72727272727,'PENDING','2026-03-29 16:07:17.552'),(3,3,'2026-06-01 00:00:00.000','2026-06-15 23:59:59.999',17500,0,17500,0,250,437.5,50,0,0,'PENDING','2026-03-29 16:07:17.552'),(4,4,'2026-06-01 00:00:00.000','2026-06-15 23:59:59.999',13250,0,13250,0,250,331.25,50,0,0,'PENDING','2026-03-29 16:07:17.552');

/*Table structure for table `position` */

DROP TABLE IF EXISTS `position`;

CREATE TABLE `position` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Position_title_key` (`title`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `position` */

insert  into `position`(`id`,`title`,`description`,`createdAt`) values (1,'Software Engineer','Development team','2026-03-29 08:47:05.831'),(2,'HR Specialist','People and Culture','2026-03-29 08:47:05.836'),(3,'Accountant','Mathematician','2026-03-29 22:21:37.175');

/*Table structure for table `schedule` */

DROP TABLE IF EXISTS `schedule`;

CREATE TABLE `schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shiftStart` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shiftEnd` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gracePeriod` int(11) NOT NULL DEFAULT '15',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Schedule_name_key` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `schedule` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
