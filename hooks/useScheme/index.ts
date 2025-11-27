import { TColorScheme } from '@/types'
import { useCallback } from 'react'
import { useColorSchemeStorage } from '../useColorSchemeStorage'

export const useScheme = () => {
	const { colorScheme } = useColorSchemeStorage()
	const scheme = useCallback(
		<T>(object: Partial<Record<TColorScheme, T>>) => {
			return object[colorScheme]
		},
		[colorScheme],
	)
	return { scheme }
}
