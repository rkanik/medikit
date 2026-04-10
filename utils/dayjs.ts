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
