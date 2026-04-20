import { relations, sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tags = sqliteTable(
	'tags',
	{
		id: int().primaryKey({ autoIncrement: true }),
		name: text().unique().notNull(),
	},
	table => [index('name_idx').on(table.name)],
)

export const patients = sqliteTable('patients', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	dob: text(),
	gender: text(),
	edd: text(),
	avatarId: int().references(() => attachments.id),
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
		patientId: int().references(() => patients.id, {
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

export const medicines = sqliteTable('medicines', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	thumbnailId: int().references(() => attachments.id),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
})

export const patientMedicines = sqliteTable('patient_medicines', {
	id: int().primaryKey({ autoIncrement: true }),
	patientId: int().references(() => patients.id, {
		onDelete: 'cascade',
	}),
	medicineId: int().references(() => medicines.id, {
		onDelete: 'cascade',
	}),
	startDate: text(),
	endDate: text(),
	schedule: text(),
	stock: int(),
})

export const attachments = sqliteTable('attachments', {
	id: int().primaryKey({ autoIncrement: true }),
	uri: text().notNull(),
	name: text().notNull(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
})

export const attachables = sqliteTable('attachables', {
	id: int().primaryKey({ autoIncrement: true }),
	attachmentId: int()
		.notNull()
		.references(() => attachments.id, {
			onDelete: 'cascade',
		}),
	recordId: int().references(() => recordsTable.id, {
		onDelete: 'cascade',
	}),
	patientId: int().references(() => patients.id, {
		onDelete: 'cascade',
	}),
	medicineId: int().references(() => medicines.id, {
		onDelete: 'cascade',
	}),
})

export const taggablesTable = sqliteTable('taggables', {
	id: int().primaryKey({ autoIncrement: true }),
	tagId: int().references(() => tags.id, {
		onDelete: 'cascade',
	}),
	recordId: int().references(() => recordsTable.id, {
		onDelete: 'cascade',
	}),
})

// Relations

export const recordRelations = relations(recordsTable, ({ many, one }) => ({
	taggables: many(taggablesTable),
	attachables: many(attachables),
	patient: one(patients, {
		fields: [recordsTable.patientId],
		references: [patients.id],
	}),
}))

export const attachableRelations = relations(attachables, ({ one }) => ({
	attachment: one(attachments, {
		fields: [attachables.attachmentId],
		references: [attachments.id],
	}),
	record: one(recordsTable, {
		fields: [attachables.recordId],
		references: [recordsTable.id],
	}),
	patient: one(patients, {
		fields: [attachables.patientId],
		references: [patients.id],
	}),
	medicine: one(medicines, {
		fields: [attachables.medicineId],
		references: [medicines.id],
	}),
}))

export const patientRelations = relations(patients, ({ one, many }) => ({
	attachables: many(attachables),
	avatar: one(attachments, {
		fields: [patients.avatarId],
		references: [attachments.id],
	}),
}))

export const medicineRelations = relations(medicines, ({ one, many }) => ({
	attachables: many(attachables),
	thumbnail: one(attachments, {
		fields: [medicines.thumbnailId],
		references: [attachments.id],
	}),
}))

export const patientMedicineRelations = relations(
	patientMedicines,
	({ one }) => ({
		patient: one(patients, {
			fields: [patientMedicines.patientId],
			references: [patients.id],
		}),
		medicine: one(medicines, {
			fields: [patientMedicines.medicineId],
			references: [medicines.id],
		}),
	}),
)

export const attachmentRelations = relations(attachments, ({ many }) => ({
	attachables: many(attachables),
}))
