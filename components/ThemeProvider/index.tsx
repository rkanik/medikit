import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { useColorScheme } from 'nativewind'
import { PropsWithChildren, useEffect } from 'react'

export type TThemeProviderProps = PropsWithChildren

export const ThemeProvider = ({ children }: TThemeProviderProps) => {
	const { colorScheme } = useColorSchemeStorage()
	const { setColorScheme } = useColorScheme()
	useEffect(() => {
		setColorScheme(colorScheme)
	}, [colorScheme, setColorScheme])
	return children
}
