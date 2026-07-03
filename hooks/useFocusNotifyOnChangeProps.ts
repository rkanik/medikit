import type { NotifyOnChangeProps } from '@tanstack/query-core'

import { useCallback, useRef } from 'react'

import { useFocusEffect } from '@react-navigation/native'

import { isWeb } from '@/utils/is'

export const useFocusNotifyOnChangeProps = (
	notifyOnChangeProps?: NotifyOnChangeProps,
): NotifyOnChangeProps | undefined => {
	const focusedRef = useRef(true)
	useFocusEffect(
		useCallback(() => {
			focusedRef.current = true
			return () => {
				focusedRef.current = false
			}
		}, []),
	)
	if (isWeb) return
	return () => {
		if (!focusedRef.current) {
			return []
		}
		if (typeof notifyOnChangeProps === 'function') {
			return notifyOnChangeProps()
		}
		return notifyOnChangeProps as any
	}
}
