import { TColorScheme } from '@/types'
import { useColorScheme } from 'nativewind'
import { useCallback } from 'react'

export const useScheme = () => {
	const { colorScheme = 'light' } = useColorScheme()
	const scheme = useCallback(
		<T>(object: Partial<Record<TColorScheme, T>>) => {
			return object[colorScheme]
		},
		[colorScheme],
	)
	return { scheme }
}
