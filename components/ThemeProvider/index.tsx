import type { PropsWithChildren } from 'react'
import { Fragment, useEffect } from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'nativewind'
import { defaultColorScheme } from '@/const'
import { colorVars } from '@/const/colors'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	const { colorScheme: colorSchemeStorage } = useColorSchemeStorage()
	const { colorScheme = defaultColorScheme, setColorScheme } = useColorScheme()
	useEffect(() => {
		setColorScheme(colorSchemeStorage)
	}, [colorSchemeStorage, setColorScheme])
	return (
		<Fragment>
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<View style={colorVars[colorScheme]} className="flex-1 bg-background">
				{children}
			</View>
		</Fragment>
	)
}
