import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { defaultColorScheme } from '@/const'
import { colors } from '@/const/colors'

export const useSchemeColors = () => {
	const colorScheme = useColorScheme() || defaultColorScheme
	return useMemo(() => colors[colorScheme], [colorScheme])
}
