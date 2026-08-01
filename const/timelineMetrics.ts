export const TIMELINE_METRICS = [
	{ key: 'height', label: 'Height', unit: 'in' },
	{ key: 'weight', label: 'Weight', unit: 'kg' },
] as const

export type TTimelineMetricKey = (typeof TIMELINE_METRICS)[number]['key']

export type TTimelineMetric = (typeof TIMELINE_METRICS)[number]
