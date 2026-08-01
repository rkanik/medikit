CREATE TABLE `patient_pregnancies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patientId` integer NOT NULL,
	`startDate` text,
	`expectedDate` text,
	`deliveryDate` text,
	`note` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pregnancy_patient_id_idx` ON `patient_pregnancies` (`patientId`);--> statement-breakpoint
CREATE TABLE `pregnancy_children` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pregnancyId` integer NOT NULL,
	`childPatientId` integer NOT NULL,
	FOREIGN KEY (`pregnancyId`) REFERENCES `patient_pregnancies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`childPatientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pregnancy_children_pregnancy_id_idx` ON `pregnancy_children` (`pregnancyId`);--> statement-breakpoint
CREATE INDEX `pregnancy_children_child_id_idx` ON `pregnancy_children` (`childPatientId`);--> statement-breakpoint
INSERT INTO `patient_pregnancies` (`patientId`, `expectedDate`)
SELECT `id`, `edd` FROM `patients` WHERE `edd` IS NOT NULL AND `edd` != '';
