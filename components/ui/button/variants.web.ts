// import type { VariantProps } from 'tailwind-variants'
// import { tv } from 'tailwind-variants'

// export type TButtonVariants = VariantProps<typeof buttonVariants>
// export const buttonVariants = tv({
// 	base: 'border inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
// 	variants: {
// 		variant: {
// 			default: 'bg-foreground text-background hover:bg-primary/90',
// 			outline:
// 				'border-input bg-background hover:bg-accent hover:text-accent-foreground',

// 			primary:
// 				'bg-primary text-primary-foreground border-primary hover:bg-primary/90',
// 			'outline-primary':
// 				'border-primary bg-background hover:bg-accent hover:text-accent-foreground',

// 			destructive:
// 				'bg-destructive text-destructive-foreground hover:bg-destructive/90',
// 			secondary:
// 				'bg-secondary text-secondary-foreground hover:bg-secondary/80',
// 			ghost: 'hover:bg-accent hover:text-accent-foreground',
// 			link: 'text-primary underline-offset-4 hover:underline',
// 		},
// 		size: {
// 			xs: 'h-8 rounded-md px-3 text-xs',
// 			default: 'h-9 px-4 py-2',
// 			sm: 'h-8 rounded-md px-3 text-xs',
// 			lg: 'h-10 rounded-md px-8',
// 			xl: 'h-12 rounded-md px-10',
// 			icon: 'h-9 w-9',
// 			'icon-lg': 'h-14 w-14',
// 			'icon-sm': 'h-11 w-11',
// 			'icon-xs': 'h-9 w-9',
// 		},
// 		pill: {
// 			true: 'rounded-full',
// 			false: '',
// 		},
// 	},
// 	defaultVariants: {
// 		pill: false,
// 		size: 'default',
// 		variant: 'default',
// 	},
// })
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export type TButtonVariants = VariantProps<typeof buttonVariants>
export const buttonVariants = tv({
	base: 'flex-row items-center justify-center gap-2 border overflow-hidden whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	variants: {
		variant: {
			default: 'bg-foreground hover:bg-primary/90',
			outline: 'border-input bg-background hover:bg-foreground',
			//
			primary: 'bg-primary border-primary hover:bg-primary/90',
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
