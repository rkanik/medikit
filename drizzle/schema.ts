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

export const records = sqliteTable(
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
	name: text(),
	mime: text(),
	size: int(),
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
	recordId: int().references(() => records.id, {
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
	recordId: int().references(() => records.id, {
		onDelete: 'cascade',
	}),
})

export const patientTimelineEntries = sqliteTable(
	'patient_timeline_entries',
	{
		id: int().primaryKey({ autoIncrement: true }),
		patientId: int()
			.notNull()
			.references(() => patients.id, {
				onDelete: 'cascade',
			}),
		date: text().notNull(),
		note: text(),
		createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	},
	table => [
		index('timeline_patient_id_idx').on(table.patientId),
		index('timeline_date_idx').on(table.date),
	],
)

export const patientTimelineValues = sqliteTable('patient_timeline_values', {
	id: int().primaryKey({ autoIncrement: true }),
	entryId: int()
		.notNull()
		.references(() => patientTimelineEntries.id, {
			onDelete: 'cascade',
		}),
	key: text().notNull(),
	value: text().notNull(),
	unit: text(),
})

export const patientPregnancies = sqliteTable(
	'patient_pregnancies',
	{
		id: int().primaryKey({ autoIncrement: true }),
		patientId: int()
			.notNull()
			.references(() => patients.id, {
				onDelete: 'cascade',
			}),
		fatherPatientId: int().references(() => patients.id, {
			onDelete: 'set null',
		}),
		startDate: text(),
		expectedDate: text(),
		deliveryDate: text(),
		note: text(),
		createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	},
	table => [
		index('pregnancy_patient_id_idx').on(table.patientId),
		index('pregnancy_father_patient_id_idx').on(table.fatherPatientId),
	],
)

export const pregnancyChildren = sqliteTable(
	'pregnancy_children',
	{
		id: int().primaryKey({ autoIncrement: true }),
		pregnancyId: int()
			.notNull()
			.references(() => patientPregnancies.id, {
				onDelete: 'cascade',
			}),
		childPatientId: int()
			.notNull()
			.references(() => patients.id, {
				onDelete: 'cascade',
			}),
	},
	table => [
		index('pregnancy_children_pregnancy_id_idx').on(table.pregnancyId),
		index('pregnancy_children_child_id_idx').on(table.childPatientId),
	],
)

// Relations

export const tagRelations = relations(tags, ({ many }) => ({
	taggables: many(taggablesTable),
}))

export const taggableRelations = relations(taggablesTable, ({ one }) => ({
	tag: one(tags, {
		fields: [taggablesTable.tagId],
		references: [tags.id],
	}),
	record: one(records, {
		fields: [taggablesTable.recordId],
		references: [records.id],
	}),
}))

export const recordRelations = relations(records, ({ many, one }) => ({
	taggables: many(taggablesTable),
	attachables: many(attachables),
	patient: one(patients, {
		fields: [records.patientId],
		references: [patients.id],
	}),
}))

export const attachableRelations = relations(attachables, ({ one }) => ({
	attachment: one(attachments, {
		fields: [attachables.attachmentId],
		references: [attachments.id],
	}),
	record: one(records, {
		fields: [attachables.recordId],
		references: [records.id],
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
	timelineEntries: many(patientTimelineEntries),
	pregnancies: many(patientPregnancies, {
		relationName: 'motherPregnancies',
	}),
	asFatherInPregnancies: many(patientPregnancies, {
		relationName: 'fatherPregnancies',
	}),
	asChildInPregnancies: many(pregnancyChildren),
	avatar: one(attachments, {
		fields: [patients.avatarId],
		references: [attachments.id],
	}),
}))

export const patientPregnancyRelations = relations(
	patientPregnancies,
	({ one, many }) => ({
		patient: one(patients, {
			fields: [patientPregnancies.patientId],
			references: [patients.id],
			relationName: 'motherPregnancies',
		}),
		father: one(patients, {
			fields: [patientPregnancies.fatherPatientId],
			references: [patients.id],
			relationName: 'fatherPregnancies',
		}),
		children: many(pregnancyChildren),
	}),
)

export const pregnancyChildRelations = relations(
	pregnancyChildren,
	({ one }) => ({
		pregnancy: one(patientPregnancies, {
			fields: [pregnancyChildren.pregnancyId],
			references: [patientPregnancies.id],
		}),
		child: one(patients, {
			fields: [pregnancyChildren.childPatientId],
			references: [patients.id],
		}),
	}),
)

export const patientTimelineEntryRelations = relations(
	patientTimelineEntries,
	({ one, many }) => ({
		patient: one(patients, {
			fields: [patientTimelineEntries.patientId],
			references: [patients.id],
		}),
		values: many(patientTimelineValues),
	}),
)

export const patientTimelineValueRelations = relations(
	patientTimelineValues,
	({ one }) => ({
		entry: one(patientTimelineEntries, {
			fields: [patientTimelineValues.entryId],
			references: [patientTimelineEntries.id],
		}),
	}),
)

export const medicineRelations = relations(medicines, ({ one, many }) => ({
	attachables: many(attachables),
	patientMedicines: many(patientMedicines),
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
