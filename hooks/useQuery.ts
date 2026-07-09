import { useMemo } from 'react'

import { useQuery as useReactQuery } from '@tanstack/react-query'

import { useFocusNotifyOnChangeProps } from './useFocusNotifyOnChangeProps'
import { useIsOnline } from './useIsOnline'
import { useRefreshOnFocus } from './useRefreshOnFocus'

export const useQuery = ((options, queryClient) => {
	const { isOnline } = useIsOnline()
	const notifyOnChangeProps = useFocusNotifyOnChangeProps()

	const enabled = useMemo(() => {
		return isOnline ? options.enabled : false
	}, [isOnline, options.enabled])

	const { refetch, ...query } = useReactQuery(
		{
			...options,
			enabled,
			notifyOnChangeProps,
			queryFn: options.queryFn,
			meta: options.meta,
		},
		queryClient,
	)

	useRefreshOnFocus(refetch)

	return { ...query, refetch }
}) as typeof useReactQuery
