CREATE TABLE `taggables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tagId` integer,
	`recordId` integer,
	FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recordId`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_patient_medicines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patientId` integer,
	`medicineId` integer,
	`startDate` text,
	`endDate` text,
	`schedule` text,
	`stock` integer,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`medicineId`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_patient_medicines`("id", "patientId", "medicineId", "startDate", "endDate", "schedule", "stock") SELECT "id", "patientId", "medicineId", "startDate", "endDate", "schedule", "stock" FROM `patient_medicines`;--> statement-breakpoint
DROP TABLE `patient_medicines`;--> statement-breakpoint
ALTER TABLE `__new_patient_medicines` RENAME TO `patient_medicines`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text,
	`date` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`patientId` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_records`("id", "text", "date", "amount", "patientId", "createdAt", "updatedAt") SELECT "id", "text", "date", "amount", "patientId", "createdAt", "updatedAt" FROM `records`;--> statement-breakpoint
DROP TABLE `records`;--> statement-breakpoint
ALTER TABLE `__new_records` RENAME TO `records`;--> statement-breakpoint
CREATE INDEX `date_idx` ON `records` (`date`);--> statement-breakpoint
CREATE INDEX `patient_id_idx` ON `records` (`patientId`);--> statement-breakpoint
DROP INDEX `name_unique_idx`;--> statement-breakpoint
CREATE TABLE `__new_attachables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attachmentId` integer NOT NULL,
	`recordId` integer,
	`patientId` integer,
	`medicineId` integer,
	FOREIGN KEY (`attachmentId`) REFERENCES `attachments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recordId`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`medicineId`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_attachables`("id", "attachmentId", "recordId", "patientId", "medicineId") SELECT "id", "attachmentId", "recordId", "patientId", "medicineId" FROM `attachables`;--> statement-breakpoint
DROP TABLE `attachables`;--> statement-breakpoint
ALTER TABLE `__new_attachables` RENAME TO `attachables`;