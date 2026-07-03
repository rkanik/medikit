import type { TButtonVariants } from '.'

import { useMemo } from 'react'

import { tv } from 'tailwind-variants'

import { useColors } from '@/hooks/useColors'

export const useButtonForegroundVariants = (
	props: Pick<TButtonVariants, 'variant'>,
) => {
	const colors = useColors()
	const colorVariants = useMemo(() => {
		return tv({
			base: '',
			variants: {
				variant: {
					default: colors.background,
					primary: colors['primary-foreground'],
					'outline-primary': colors.primary,
					destructive: colors['destructive-foreground'],
					outline: colors.foreground,
					secondary: colors['secondary-foreground'],
					ghost: colors['accent-foreground'],
					link: colors['primary-foreground'],
				},
			},
			defaultVariants: {
				variant: 'default',
			},
		})
	}, [colors])
	return colorVariants(props)
}
