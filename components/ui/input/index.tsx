import { forwardRef, useState } from 'react'
import { TextInput, TextInputProps } from 'react-native'
import { tv, VariantProps } from 'tailwind-variants'

const inputVariants = tv({
	base: 'rounded-lg',
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
		error?: boolean
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
	return (
		<TextInput
			{...props}
			ref={ref}
			data-focus={true}
			className={inputVariants({
				size,
				error,
				focus,
				variant,
				className,
			})}
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
