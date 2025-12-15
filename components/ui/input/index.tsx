import { useSchemeColors } from '@/hooks/useSchemeColors'
import { forwardRef, useState } from 'react'
import { TextInput, TextInputProps } from 'react-native'
import { tv, VariantProps } from 'tailwind-variants'

export const inputVariants = tv({
	base: 'rounded-lg flex-row items-center justify-between overflow-hidden',
	variants: {
		variant: {
			base: 'bg-white dark:bg-neutral-700 text-black dark:text-white border',
		},
		size: {
			base: 'px-4 min-h-14 text-lg leading-snug',
		},
		focus: {
			true: '',
			false: '',
		},
		error: {
			true: '',
			false: '',
		},
	},
	compoundVariants: [
		{
			error: true,
			focus: [true, false],
			class: 'border-red-500',
		},
		{
			error: false,
			focus: true,
			class: 'border-green-500',
		},
		{
			error: false,
			focus: false,
			class: 'border-transparent',
		},
	],
	defaultVariants: {
		size: 'base',
		variant: 'base',
	},
})

export type TInputProps = TextInputProps &
	VariantProps<typeof inputVariants> & {
		//
	}

export const Input = forwardRef<TextInput, TInputProps>(function Input(
	{
		error,
		className,
		size = 'base',
		variant = 'base',
		onBlur,
		onFocus,
		...props
	},
	ref,
) {
	const [focus, setFocus] = useState(false)
	const { textColorSecondary } = useSchemeColors()
	return (
		<TextInput
			{...props}
			ref={ref}
			className={inputVariants({
				size,
				error,
				focus,
				variant,
				className,
			})}
			placeholderTextColor={textColorSecondary}
			onFocus={e => {
				onFocus?.(e)
				setFocus(true)
			}}
			onBlur={e => {
				onBlur?.(e)
				setFocus(false)
			}}
		/>
	)
})
