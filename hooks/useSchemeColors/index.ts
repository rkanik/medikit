import { colors } from '@/const/colors'
import { useScheme } from '../useScheme'

export const useSchemeColors = () => {
	const { scheme } = useScheme()
	return {
		backgroundColor: scheme({
			dark: colors.neutral[900],
			light: colors.green[50],
		}),
		borderColor: scheme({
			dark: colors.neutral[700],
			light: colors.green[200],
		}),
	}
}
