import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'
import { $d } from '@/utils/dayjs'

type TUsePatientMedicinesQuery = {
	patientId: number
}

export const usePatientMedicinesQuery = ({
	patientId,
}: TUsePatientMedicinesQuery) => {
	return useQuery({
		queryKey: ['patient-medicines', patientId],
		initialData: [],
		queryFn: async () => {
			if (isNaN(patientId)) return []
			const today = $d()
			const items = await db.query.patientMedicines.findMany({
				where: (v, { eq }) => eq(v.patientId, patientId),
				with: {
					medicine: {
						with: {
							thumbnail: true,
							attachables: true,
						},
					},
				},
			})
			return items.sort((a, b) => {
				const ended = (end?: string | null) =>
					!!end && !$d(end).isAfter(today, 'day')
				const aEnded = ended(a.endDate)
				const bEnded = ended(b.endDate)
				if (aEnded !== bEnded) return aEnded ? 1 : -1
				return (
					new Date(b.startDate ?? '').getTime() -
					new Date(a.startDate ?? '').getTime()
				)
			})
		},
	})
}
