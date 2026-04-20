import { useCallback, useRef } from 'react'

import { useFocusEffect } from '@react-navigation/native'

import { isWeb } from '@/utils/is'

export function useRefreshOnFocus<T>(refetch: () => Promise<T> | undefined) {
	const firstTimeRef = useRef(true)
	useFocusEffect(
		useCallback(() => {
			if (isWeb) return
			if (firstTimeRef.current) {
				firstTimeRef.current = false
				return
			}
			refetch()
		}, [refetch]),
	)
}
