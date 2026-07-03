import type { TColors } from '@/types'
import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { defaultColorScheme } from '@/const'
import { colors } from '@/const/colors'

export const useColors = <T = TColors>(callback?: (colors: TColors) => T) => {
	const colorScheme = useColorScheme() || defaultColorScheme
	return useMemo(() => {
		const v = colors[colorScheme] as TColors
		if (!callback) return v
		return callback(v)
	}, [callback, colorScheme]) as T
}
