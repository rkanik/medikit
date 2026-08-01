import type { TPatient } from '@/types/database'

/** Normalize patient for UI. Avatar URIs stay as stored; resolve with `paths.document` at display. */
export const mapPatient = (patient?: TPatient | null) => {
	if (!patient) return patient
	return patient
}
