import dayjs from 'dayjs'

export const $df = (date: any, format: string, fallback = '') => {
	const d = dayjs(date)
	if (d.isValid()) return d.format(format)
	return fallback
}

export const $dfr = (start: any, end: any) => {
	const s = $d(start)
	const e = $d(end)
	const y = $d()
	const sameYear = s.year() === e.year()
	const sameMonth = s.month() === e.month()
	const startFmt =
		sameYear && sameMonth
			? $df(start, 'DD')
			: sameYear
				? $df(start, 'DD MMM')
				: $df(start, `DD MMM${s.year() !== y.year() ? ', YYYY' : ''}`)
	const endFmt = $df(end, `DD MMM${e.year() !== y.year() ? ', YYYY' : ''}`)
	return `${startFmt} - ${endFmt}`
}

export const $d = dayjs

export const $daf = (dob: any) => {
	const birth = $d(dob).startOf('day')
	if (!birth.isValid()) return ''

	const today = $d().startOf('day')
	if (birth.isAfter(today)) return ''

	const years = today.diff(birth, 'year')
	const afterYears = birth.add(years, 'year')
	const months = today.diff(afterYears, 'month')
	const afterMonths = afterYears.add(months, 'month')
	const days = today.diff(afterMonths, 'day')

	const parts: string[] = []
	if (years > 0) {
		parts.push(
			`${String(years).padStart(2, '0')} ${years === 1 ? 'year' : 'years'}`,
		)
	}
	if (months > 0) {
		parts.push(
			`${String(months).padStart(2, '0')} ${months === 1 ? 'month' : 'months'}`,
		)
	}
	if (days > 0) {
		parts.push(
			`${String(days).padStart(2, '0')} ${days === 1 ? 'day' : 'days'}`,
		)
	}

	return parts.join(' ')
}
