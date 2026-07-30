import { $d } from '@/utils/dayjs'

/** Full-term pregnancy ≈ 40 weeks from LMP (280 days). */
const TERM_DAYS = 280

export type TGestationalAge = {
	weeks: number
	days: number
	gestationalDays: number
}

export const gestationalAgeFromEdd = (
	edd: string,
	atDate?: string | null,
): TGestationalAge | null => {
	const due = $d(edd).startOf('day')
	const at = $d(atDate ?? undefined).startOf('day')
	if (!due.isValid() || !at.isValid()) return null

	const daysUntilDue = due.diff(at, 'day')
	const gestationalDays = Math.max(0, TERM_DAYS - daysUntilDue)
	return {
		gestationalDays,
		weeks: Math.floor(gestationalDays / 7),
		days: gestationalDays % 7,
	}
}

export const formatGestationalAge = (age: TGestationalAge | null) => {
	if (!age) return ''
	const weeksLabel = `${age.weeks} ${age.weeks === 1 ? 'week' : 'weeks'}`
	if (age.days <= 0) return weeksLabel
	return `${weeksLabel} ${age.days} ${age.days === 1 ? 'day' : 'days'}`
}

export const isCurrentlyPregnant = (pregnancy: {
	expectedDate?: string | null
	deliveryDate?: string | null
}) => {
	if (pregnancy.deliveryDate) return false
	if (!pregnancy.expectedDate) return false
	const edd = $d(pregnancy.expectedDate).startOf('day')
	if (!edd.isValid()) return false
	return edd.isAfter($d().startOf('day')) || edd.isSame($d().startOf('day'), 'day')
}
