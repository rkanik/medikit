import { useCallback } from 'react'
import { useColorScheme } from 'react-native'

export const useScheme = () => {
	const colorScheme = useColorScheme() || 'dark'
	const scheme = useCallback(
		<T>(object: Partial<Record<'light' | 'dark', T>>) => {
			return object[colorScheme]
		},
		[colorScheme],
	)
	return { scheme }
}
