import { green, neutral } from 'tailwindcss/colors'
import { useScheme } from '../useScheme'

export const useSchemeColors = () => {
	const { scheme } = useScheme()
	return {
		backgroundColor: scheme({
			dark: neutral[900],
			light: green[50],
		}),
		borderColor: scheme({
			dark: neutral[700],
			light: green[200],
		}),
	}
}
