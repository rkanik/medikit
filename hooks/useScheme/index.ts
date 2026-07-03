import type { TColorScheme } from '@/types'
import { useCallback } from 'react'
import { useColorScheme } from 'react-native'
import { defaultColorScheme } from '@/const'

export const useScheme = () => {
	const colorScheme = useColorScheme() || defaultColorScheme
	const scheme = useCallback(
		<T>(object: Partial<Record<TColorScheme, T>>) => {
			return object[colorScheme]
		},
		[colorScheme],
	)
	return { scheme }
}
