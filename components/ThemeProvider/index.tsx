import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { PropsWithChildren, useEffect } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'

export type TThemeProviderProps = PropsWithChildren

export const ThemeProvider = ({ children }: TThemeProviderProps) => {
	const { colorScheme } = useColorSchemeStorage()
	useEffect(() => {
		if (colorScheme === 'system') {
			const listener = (preferences?: Appearance.AppearancePreferences) => {
				Appearance.setColorScheme(
					preferences?.colorScheme || Appearance.getColorScheme(),
				)
			}
			listener()
			const subscription = Appearance.addChangeListener(listener)
			return () => {
				subscription.remove()
			}
		} else {
			Appearance.setColorScheme(colorScheme as ColorSchemeName)
		}
	}, [colorScheme])
	return children
}
