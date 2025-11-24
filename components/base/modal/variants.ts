import { tva } from '@gluestack-ui/utils/nativewind-utils'

export const baseModalVariants = tva({
	base: 'max-h-full w-full rounded-2xl bg-white',
	variants: {
		size: {
			[`sm`]: 'max-w-sm',
			[`md`]: 'max-w-md',
			[`lg`]: 'max-w-lg',
			[`xl`]: 'max-w-xl',
			[`2xl`]: 'max-w-2xl',
			[`3xl`]: 'max-w-3xl',
			[`4xl`]: 'max-w-4xl',
			[`5xl`]: 'max-w-5xl',
			[`6xl`]: 'max-w-6xl',
			[`7xl`]: 'max-w-7xl',
		},
	},
	defaultVariants: {
		size: 'xl',
	},
})
