import type { TColorSchemeStorage } from '@/types'
import { useMMKVString } from 'react-native-mmkv'
import { defaultColorScheme } from '@/const'

export const useColorSchemeStorage = () => {
	const [colorScheme = defaultColorScheme, setColorScheme] =
		useMMKVString('colorScheme')
	return {
		colorScheme,
		setColorScheme,
	} as {
		colorScheme: TColorSchemeStorage
		setColorScheme: React.Dispatch<React.SetStateAction<TColorSchemeStorage>>
	}
}
