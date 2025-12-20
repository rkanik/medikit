import type { PropsWithChildren } from 'react'

import { useEffect } from 'react'

import { useColorScheme } from 'nativewind'

import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'

export type TThemeProviderProps = PropsWithChildren

export const ThemeProvider = ({ children }: TThemeProviderProps) => {
	const { colorScheme } = useColorSchemeStorage()
	const { setColorScheme } = useColorScheme()
	useEffect(() => {
		setColorScheme(colorScheme)
	}, [colorScheme, setColorScheme])
	return children
}
