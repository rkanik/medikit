import { colors } from '@/const/colors'
import { useScheme } from '../useScheme'

export const useSchemeColors = () => {
	const { scheme } = useScheme()
	return {
		textColor: scheme({
			dark: 'white',
			light: 'black',
		}),
		textColorSecondary: scheme({
			dark: colors.neutral[500],
			light: colors.neutral[500],
		}),
		backgroundColor: scheme({
			dark: 'black',
			light: colors.neutral[200],
		}),
		borderColor: scheme({
			dark: colors.neutral[700],
			light: colors.green[200],
		}),
	}
}
