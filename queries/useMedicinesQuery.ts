import { eq, sql } from 'drizzle-orm'

import { db } from '@/drizzle/db'
import { attachments, medicines, patientMedicines } from '@/drizzle/schema'
import { useQuery } from '@/hooks/useQuery'

export const useMedicinesQuery = () => {
	return useQuery({
		queryKey: ['medicines'],
		initialData: [],
		queryFn: async () => {
			const rows = await db
				.select({
					id: medicines.id,
					name: medicines.name,
					createdAt: medicines.createdAt,
					updatedAt: medicines.updatedAt,
					thumbnailId: medicines.thumbnailId,
					thumbnail: attachments,
					patientMedicineCount: sql<number>`count(${patientMedicines.id})`,
				})
				.from(medicines)
				.leftJoin(attachments, eq(attachments.id, medicines.thumbnailId))
				.leftJoin(
					patientMedicines,
					eq(patientMedicines.medicineId, medicines.id),
				)
				.groupBy(medicines.id, attachments.id)

			return rows.map(row => ({
				id: row.id,
				name: row.name,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
				thumbnailId: row.thumbnailId,
				thumbnail: row.thumbnail ?? undefined,
				patientMedicineCount: Number(row.patientMedicineCount ?? 0),
				isRemoveable: Number(row.patientMedicineCount ?? 0) === 0,
			}))
		},
	})
}
