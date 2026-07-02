import type { TPatient } from '@/types/database'

import { paths } from '@/utils/paths'

export const mapPatient = (patient?: TPatient | null) => {
	if (!patient) return patient
	return {
		...patient,
		avatar: patient.avatar
			? {
					...patient.avatar,
					uri: paths.document(patient.avatar.uri),
				}
			: undefined,
	}
}
