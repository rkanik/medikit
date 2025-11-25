import dayjs from 'dayjs'

export const $df = (date: any, format: string, fallback = '') => {
	const d = dayjs(date)
	if (d.isValid()) return d.format(format)
	return fallback
}

export const $d = dayjs
