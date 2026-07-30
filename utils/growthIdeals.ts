import { $d } from '@/utils/dayjs'

/** Convert height in feet (decimal, e.g. 5.6) to cm. */
export const heightFtToCm = (ft: number) => ft * 30.48

/** Convert cm to feet (decimal), rounded to 1 decimal. */
export const heightCmToFt = (cm: number) => Math.round((cm / 30.48) * 10) / 10

export const formatSincePrevious = (currentDate: string, previousDate: string) => {
	const current = $d(currentDate).startOf('day')
	const previous = $d(previousDate).startOf('day')
	if (!current.isValid() || !previous.isValid()) return null

	const days = current.diff(previous, 'day')
	if (days <= 0) return null

	if (days < 7) {
		return `${days} ${days === 1 ? 'day' : 'days'} later`
	}

	const weeks = Math.floor(days / 7)
	if (days < 45) {
		return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} later`
	}

	const months = current.diff(previous, 'month')
	if (months < 12) {
		const remDays = current.diff(previous.add(months, 'month'), 'day')
		const remWeeks = Math.floor(remDays / 7)
		if (remWeeks > 0) {
			return `${months} ${months === 1 ? 'month' : 'months'} ${remWeeks} ${remWeeks === 1 ? 'week' : 'weeks'} later`
		}
		return `${months} ${months === 1 ? 'month' : 'months'} later`
	}

	const years = current.diff(previous, 'year')
	const afterYears = previous.add(years, 'year')
	const remMonths = current.diff(afterYears, 'month')
	if (remMonths > 0) {
		return `${years} ${years === 1 ? 'year' : 'years'} ${remMonths} ${remMonths === 1 ? 'month' : 'months'} later`
	}
	return `${years} ${years === 1 ? 'year' : 'years'} later`
}

export const percentChange = (current: number, previous: number) => {
	if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
		return null
	}
	return ((current - previous) / previous) * 100
}

export const formatPercentChange = (pct: number | null) => {
	if (pct == null || Number.isNaN(pct)) return null
	const rounded = Math.round(pct * 10) / 10
	const sign = rounded > 0 ? '+' : ''
	return `${sign}${rounded}%`
}

/**
 * Approximate median height (cm) / weight (kg) by age (years) and gender.
 * Based on WHO/CDC-style mid-range values for children; adults use height-based weight.
 */
const CHILD_IDEALS: Record<
	number,
	{ male: { heightCm: number; weightKg: number }; female: { heightCm: number; weightKg: number } }
> = {
	1: { male: { heightCm: 76, weightKg: 10 }, female: { heightCm: 74, weightKg: 9 } },
	2: { male: { heightCm: 87, weightKg: 12 }, female: { heightCm: 86, weightKg: 12 } },
	3: { male: { heightCm: 96, weightKg: 14 }, female: { heightCm: 95, weightKg: 14 } },
	4: { male: { heightCm: 103, weightKg: 16 }, female: { heightCm: 102, weightKg: 16 } },
	5: { male: { heightCm: 110, weightKg: 18 }, female: { heightCm: 109, weightKg: 18 } },
	6: { male: { heightCm: 116, weightKg: 21 }, female: { heightCm: 115, weightKg: 20 } },
	7: { male: { heightCm: 122, weightKg: 23 }, female: { heightCm: 121, weightKg: 23 } },
	8: { male: { heightCm: 128, weightKg: 26 }, female: { heightCm: 127, weightKg: 26 } },
	9: { male: { heightCm: 134, weightKg: 29 }, female: { heightCm: 133, weightKg: 29 } },
	10: { male: { heightCm: 139, weightKg: 32 }, female: { heightCm: 138, weightKg: 33 } },
	11: { male: { heightCm: 144, weightKg: 36 }, female: { heightCm: 144, weightKg: 37 } },
	12: { male: { heightCm: 149, weightKg: 41 }, female: { heightCm: 151, weightKg: 42 } },
	13: { male: { heightCm: 156, weightKg: 47 }, female: { heightCm: 157, weightKg: 47 } },
	14: { male: { heightCm: 164, weightKg: 53 }, female: { heightCm: 160, weightKg: 50 } },
	15: { male: { heightCm: 170, weightKg: 59 }, female: { heightCm: 162, weightKg: 53 } },
	16: { male: { heightCm: 174, weightKg: 64 }, female: { heightCm: 163, weightKg: 55 } },
	17: { male: { heightCm: 176, weightKg: 68 }, female: { heightCm: 163, weightKg: 56 } },
	18: { male: { heightCm: 177, weightKg: 70 }, female: { heightCm: 163, weightKg: 57 } },
}

/** Devine ideal body weight (kg) from height in cm. */
const idealWeightFromHeightCm = (heightCm: number, gender?: string | null) => {
	const inches = heightCm / 2.54
	const over5ft = Math.max(0, inches - 60)
	const isFemale = (gender ?? '').toLowerCase().startsWith('f')
	const base = isFemale ? 45.5 : 50
	return Math.round((base + 2.3 * over5ft) * 10) / 10
}

export type TGrowthIdeal = {
	ageYears: number
	heightFt?: number
	weightKg?: number
	source: 'age' | 'height'
}

export const getGrowthIdeal = (options: {
	dob?: string | null
	atDate: string
	gender?: string | null
	heightFt?: number | null
}): TGrowthIdeal | null => {
	const birth = $d(options.dob).startOf('day')
	const at = $d(options.atDate).startOf('day')
	if (!birth.isValid() || !at.isValid() || at.isBefore(birth)) return null

	const ageYears = Math.max(0, at.diff(birth, 'year'))
	const isFemale = (options.gender ?? '').toLowerCase().startsWith('f')
	const sex = isFemale ? 'female' : 'male'

	if (ageYears <= 18) {
		const row = CHILD_IDEALS[Math.min(18, Math.max(1, ageYears))]
		if (!row) return null
		const ideal = row[sex]
		return {
			ageYears,
			heightFt: heightCmToFt(ideal.heightCm),
			weightKg: ideal.weightKg,
			source: 'age',
		}
	}

	// Adults: ideal weight from measured height (Devine); height itself is not age-based.
	if (options.heightFt != null && options.heightFt > 0) {
		return {
			ageYears,
			weightKg: idealWeightFromHeightCm(heightFtToCm(options.heightFt), options.gender),
			source: 'height',
		}
	}

	return {
		ageYears,
		source: 'age',
	}
}
