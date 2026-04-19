import { relations, sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tagsTable = sqliteTable(
	'tags',
	{
		id: int().primaryKey({ autoIncrement: true }),
		name: text().unique().notNull(),
	},
	table => [index('name_idx').on(table.name)],
)

export const patientsTable = sqliteTable('patients', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	dob: text(),
	gender: text(),
	edd: text(),
	avatarId: int().references(() => attachmentsTable.id),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
})

export const recordsTable = sqliteTable(
	'records',
	{
		id: int().primaryKey({ autoIncrement: true }),
		text: text(),
		date: text().notNull(),
		amount: int().default(0).notNull(),
		patientId: int().references(() => patientsTable.id, {
			onDelete: 'cascade',
		}),
		createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	},
	table => [
		index('date_idx').on(table.date),
		index('patient_id_idx').on(table.patientId),
	],
)

export const medicinesTable = sqliteTable('medicines', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	thumbnailId: int().references(() => attachmentsTable.id),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
})

export const patientMedicinesTable = sqliteTable('patient_medicines', {
	id: int().primaryKey({ autoIncrement: true }),
	patientId: int().references(() => patientsTable.id, {
		onDelete: 'cascade',
	}),
	medicineId: int().references(() => medicinesTable.id, {
		onDelete: 'cascade',
	}),
	startDate: text(),
	endDate: text(),
	schedule: text(),
	stock: int(),
})

export const attachmentsTable = sqliteTable('attachments', {
	id: int().primaryKey({ autoIncrement: true }),
	uri: text().notNull(),
	name: text().notNull(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
})

export const attachablesTable = sqliteTable('attachables', {
	id: int().primaryKey({ autoIncrement: true }),
	attachmentId: int()
		.notNull()
		.references(() => attachmentsTable.id, {
			onDelete: 'cascade',
		}),
	recordId: int().references(() => recordsTable.id, {
		onDelete: 'cascade',
	}),
	patientId: int().references(() => patientsTable.id, {
		onDelete: 'cascade',
	}),
	medicineId: int().references(() => medicinesTable.id, {
		onDelete: 'cascade',
	}),
})

export const taggablesTable = sqliteTable('taggables', {
	id: int().primaryKey({ autoIncrement: true }),
	tagId: int().references(() => tagsTable.id, {
		onDelete: 'cascade',
	}),
	recordId: int().references(() => recordsTable.id, {
		onDelete: 'cascade',
	}),
})

// Relations

export const recordRelations = relations(recordsTable, ({ many, one }) => ({
	taggables: many(taggablesTable),
	attachables: many(attachablesTable),
	patient: one(patientsTable, {
		fields: [recordsTable.patientId],
		references: [patientsTable.id],
	}),
}))

export const attachableRelations = relations(attachablesTable, ({ one }) => ({
	attachment: one(attachmentsTable, {
		fields: [attachablesTable.attachmentId],
		references: [attachmentsTable.id],
	}),
	record: one(recordsTable, {
		fields: [attachablesTable.recordId],
		references: [recordsTable.id],
	}),
	patient: one(patientsTable, {
		fields: [attachablesTable.patientId],
		references: [patientsTable.id],
	}),
	medicine: one(medicinesTable, {
		fields: [attachablesTable.medicineId],
		references: [medicinesTable.id],
	}),
}))

export const patientRelations = relations(patientsTable, ({ one, many }) => ({
	attachables: many(attachablesTable),
	avatar: one(attachmentsTable, {
		fields: [patientsTable.avatarId],
		references: [attachmentsTable.id],
	}),
}))

export const medicineRelations = relations(medicinesTable, ({ one, many }) => ({
	attachables: many(attachablesTable),
	thumbnail: one(attachmentsTable, {
		fields: [medicinesTable.thumbnailId],
		references: [attachmentsTable.id],
	}),
}))

export const patientMedicineRelations = relations(
	patientMedicinesTable,
	({ one }) => ({
		patient: one(patientsTable, {
			fields: [patientMedicinesTable.patientId],
			references: [patientsTable.id],
		}),
		medicine: one(medicinesTable, {
			fields: [patientMedicinesTable.medicineId],
			references: [medicinesTable.id],
		}),
	}),
)

export const attachmentRelations = relations(attachmentsTable, ({ many }) => ({
	attachables: many(attachablesTable),
}))
