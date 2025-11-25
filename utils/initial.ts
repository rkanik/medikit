export const initial = (text: string): string => {
	return text
		.split(' ')
		.map(word => word.charAt(0).toUpperCase())
		.join('')
}
