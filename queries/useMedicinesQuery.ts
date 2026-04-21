import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

export const useMedicinesQuery = () => {
	return useQuery({
		queryKey: ['medicines'],
		initialData: [],
		queryFn() {
			return db.query.medicines.findMany({
				with: {
					thumbnail: true,
					patientMedicines: {
						limit: 1,
						columns: {
							id: true,
						},
					},
				},
			})
		},
	})
}
