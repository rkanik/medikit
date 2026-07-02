import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import type { Href } from 'expo-router'

const getRecordsQuerySearch = (query: TRecordsQuery) => {
	const params = new URLSearchParams()
	if (query.patientId != null) params.set('patientId', String(query.patientId))
	if (query.q) params.set('q', query.q)
	const qs = params.toString()
	return qs ? `?${qs}` : ''
}

export const hrefRecordsSummary = (query: TRecordsQuery): Href =>
	`/records-summary${getRecordsQuerySearch(query)}` as Href
