CREATE TABLE `attachables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attachmentId` integer NOT NULL,
	`recordId` integer,
	`patientId` integer,
	`medicineId` integer
);
--> statement-breakpoint
CREATE TABLE `medicines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`thumbnailId` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`thumbnailId`) REFERENCES `attachments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patient_medicines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patientId` integer,
	`medicineId` integer,
	`startDate` text,
	`endDate` text,
	`schedule` text,
	`stock` integer,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`medicineId`) REFERENCES `medicines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text,
	`date` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`patientId` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `date_idx` ON `records` (`date`);--> statement-breakpoint
CREATE INDEX `patient_id_idx` ON `records` (`patientId`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `name_unique_idx` ON `tags` (`name`);--> statement-breakpoint
ALTER TABLE `patients` ADD `avatarId` integer REFERENCES attachments(id);