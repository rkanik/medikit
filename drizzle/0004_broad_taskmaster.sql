CREATE TABLE `patient_timeline_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patientId` integer NOT NULL,
	`date` text NOT NULL,
	`note` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `timeline_patient_id_idx` ON `patient_timeline_entries` (`patientId`);--> statement-breakpoint
CREATE INDEX `timeline_date_idx` ON `patient_timeline_entries` (`date`);--> statement-breakpoint
CREATE TABLE `patient_timeline_values` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entryId` integer NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`unit` text,
	FOREIGN KEY (`entryId`) REFERENCES `patient_timeline_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
