/** Total inches → feet + remaining inches. */
export const inchesToParts = (totalInches: number) => {
	if (!Number.isFinite(totalInches) || totalInches < 0) return null
	const rounded = Math.round(totalInches)
	const feet = Math.floor(rounded / 12)
	const inches = rounded % 12
	return { feet, inches }
}

/** Format total inches as 5'10". */
export const formatHeightFt = (
	totalInches: string | number | null | undefined,
) => {
	if (totalInches == null || totalInches === '') return ''
	const num =
		typeof totalInches === 'number'
			? totalInches
			: Number(String(totalInches).trim())
	if (!Number.isFinite(num)) return String(totalInches)
	const parts = inchesToParts(num)
	if (!parts) return String(totalInches)
	return `${parts.feet}'${parts.inches}"`
}
