import type { ComponentProps } from 'react'
import type Feather from '@expo/vector-icons/Feather'
import { formatHeightFt } from '@/utils/height'

type TFeatherIconName = ComponentProps<typeof Feather>['name']

export const TIMELINE_METRICS = [
	{
		key: 'height',
		label: 'Height',
		unit: 'in',
		inputType: 'number',
		icon: 'maximize-2',
	},
	{
		key: 'weight',
		label: 'Weight',
		unit: 'kg',
		inputType: 'number',
		icon: 'box',
	},
	{
		key: 'bp',
		label: 'Blood Pressure',
		unit: 'mmHg',
		inputType: 'text',
		icon: 'heart',
		placeholder: '120/80',
	},
	{
		key: 'pulse',
		label: 'Pulse',
		unit: 'bpm',
		inputType: 'number',
		icon: 'activity',
	},
	{
		key: 'temperature',
		label: 'Temperature',
		unit: '°F',
		inputType: 'number',
		icon: 'thermometer',
	},
	{
		key: 'bloodSugar',
		label: 'Blood Sugar',
		unit: 'mg/dL',
		inputType: 'number',
		icon: 'droplet',
	},
	{
		key: 'fever',
		label: 'Fever',
		unit: null,
		inputType: 'boolean',
		icon: 'alert-circle',
	},
	{
		key: 'oxygen',
		label: 'Oxygen',
		unit: '%',
		inputType: 'number',
		icon: 'wind',
	},
] as const satisfies ReadonlyArray<{
	key: string
	label: string
	unit: string | null
	inputType: 'number' | 'text' | 'boolean'
	icon: TFeatherIconName
	placeholder?: string
}>

export type TTimelineMetricKey = (typeof TIMELINE_METRICS)[number]['key']

export type TTimelineMetric = (typeof TIMELINE_METRICS)[number]

export const TIMELINE_BOOLEAN_OPTIONS = [
	{ label: 'Yes', value: 'yes' },
	{ label: 'No', value: 'no' },
] as const

export const getTimelineMetric = (key: string) =>
	TIMELINE_METRICS.find(metric => metric.key === key) ?? null

export const isTimelineMetricKey = (key: unknown): key is TTimelineMetricKey =>
	typeof key === 'string' && TIMELINE_METRICS.some(metric => metric.key === key)

export const formatTimelineMetricValue = (
	key: string,
	raw: string | null | undefined,
	unit?: string | null,
) => {
	const value = String(raw ?? '').trim()
	if (!value) return null

	const metric = getTimelineMetric(key)
	const resolvedUnit = unit ?? metric?.unit ?? null

	if (metric?.inputType === 'boolean' || key === 'fever') {
		if (value === 'yes' || value === 'true' || value === '1') return 'Yes'
		if (value === 'no' || value === 'false' || value === '0') return 'No'
		return value
	}

	if (key === 'height') {
		return formatHeightFt(value)
	}

	if (resolvedUnit) {
		return `${value} ${resolvedUnit}`
	}

	return value
}

export const parseTimelineMetricFormValue = (
	metric: TTimelineMetric,
	raw: string,
): { key: string; value: string; unit: string | null } | null => {
	const trimmed = String(raw ?? '').trim()
	if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
		return null
	}

	if (metric.inputType === 'boolean') {
		const normalized = trimmed.toLowerCase()
		if (normalized !== 'yes' && normalized !== 'no') return null
		return {
			key: metric.key,
			value: normalized,
			unit: metric.unit,
		}
	}

	if (metric.inputType === 'number') {
		const num = Number(trimmed)
		if (Number.isNaN(num)) return null
		return {
			key: metric.key,
			value: String(num),
			unit: metric.unit,
		}
	}

	return {
		key: metric.key,
		value: trimmed,
		unit: metric.unit,
	}
}

/** Numeric value for % change. BP uses systolic (left of `/`). */
export const toTimelineMetricNumber = (
	key: string,
	raw: string | null | undefined,
) => {
	const value = String(raw ?? '').trim()
	if (!value) return null

	const metric = getTimelineMetric(key)
	if (metric?.inputType === 'boolean') return null

	if (key === 'bp' || value.includes('/')) {
		const systolic = Number(value.split('/')[0]?.trim())
		return Number.isFinite(systolic) ? systolic : null
	}

	const num = Number(value)
	return Number.isFinite(num) ? num : null
}
