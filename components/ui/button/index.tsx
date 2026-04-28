import type { TButtonProps } from './types'
import { cn, tv } from 'tailwind-variants'
import { Pressable } from '@/components/ui/pressable'
import { TextProvider } from '../text'
import { buttonVariants } from './variants'
export * from './types'
export * from './variants'

export const Button = ({
	ref,
	size,
	pill,
	variant,
	disabled,
	className,
	...props
}: TButtonProps) => {
	return (
		<TextProvider className={textVariants({ variant, size })}>
			<Pressable
				ref={ref}
				disabled={disabled}
				style={{ opacity: disabled ? 0.5 : 1 }}
				className={cn(
					buttonVariants({
						size,
						pill,
						variant,
						className,
					}),
				)}
				{...props}
			/>
		</TextProvider>
	)
}

const textVariants = tv({
	base: 'font-medium',
	variants: {
		variant: {
			default: 'text-background',
			outline: 'text-foreground',
			primary: 'text-primary-foreground',
			'outline-primary': 'text-primary',
			destructive: 'text-destructive-foreground ',
			secondary: 'text-foreground ',
			ghost: 'text-secondary-foreground',
			link: 'text-primary underline-offset-4',
		},
		size: {
			xl: 'text-base',
			lg: 'text-base',
			default: 'text-base',
			sm: 'text-sm',
			xs: 'text-sm',
			xxs: 'text-xs',
			'icon-lg': '',
			'icon-xl': '',
			icon: '',
			'icon-sm': '',
			'icon-xs': '',
			'icon-xxs': '',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
	},
})
