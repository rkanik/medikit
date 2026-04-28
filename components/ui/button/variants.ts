import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export type TButtonVariants = VariantProps<typeof buttonVariants>
export const buttonVariants = tv({
	base: 'flex-row items-center justify-center gap-2 border overflow-hidden',
	variants: {
		variant: {
			default: 'bg-foreground',
			outline: 'border-input bg-background',
			//
			primary: 'bg-primary border-primary',
			'outline-primary': 'border-primary bg-background',
			//
			destructive: 'bg-destructive border-destructive',
			secondary: 'bg-secondary border-secondary',
			ghost: 'bg-transparent border-transparent',
			link: '',
		},
		size: {
			xl: 'min-h-16 rounded-xl px-6 py-4 gap-4',
			lg: 'min-h-14 rounded-xl px-5 py-3 gap-3',
			default: 'min-h-12 rounded-lg px-4 py-2',
			sm: 'min-h-10 rounded-md px-3',
			xs: 'min-h-9 rounded-md px-3',
			xxs: 'min-h-6 rounded px-2 gap-1',
			'icon-lg': 'min-h-14 min-w-14 rounded-xl',
			'icon-xl': 'min-h-16 min-w-16 rounded-xl',
			icon: 'min-h-12 min-w-12 rounded-lg',
			'icon-sm': 'min-h-11 min-w-11 rounded-md',
			'icon-xs': 'min-h-9 min-w-9 rounded-md',
			'icon-xxs': 'min-h-8 min-w-8 rounded-md',
		},
		pill: {
			true: 'rounded-full',
			false: '',
		},
	},
	defaultVariants: {
		pill: false,
		size: 'default',
		variant: 'default',
	},
})
