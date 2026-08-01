import { useMemo } from 'react'
import { mapPatient } from '@/queries/mapPatient'
import {
	usePatientsQuery,
	type TPatientsQuery,
} from '@/queries/usePatientsQuery'

export const usePatientsListQuery = (
	query?: Pick<TPatientsQuery, 'includePrivate' | 'perPage' | 'withRecords'>,
) => {
	const listQuery = usePatientsQuery({
		page: 1,
		perPage: query?.perPage ?? 500,
		includePrivate: query?.includePrivate,
		withRecords: query?.withRecords,
	})

	const data = useMemo(() => {
		return (listQuery.data?.pages ?? [])
			.flatMap(page => page.data ?? [])
			.map(patient => mapPatient(patient)!)
	}, [listQuery.data?.pages])

	return {
		...listQuery,
		data,
	}
}
