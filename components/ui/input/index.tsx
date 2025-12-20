import type { TextInputProps } from 'react-native'
import type { VariantProps } from 'tailwind-variants'

import { forwardRef, useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'

import { tv } from 'tailwind-variants'

import { useSchemeColors } from '@/hooks/useSchemeColors'

import { Icon } from '../icon'

export const inputVariants = tv({
	base: 'rounded-lg flex-row items-center justify-between overflow-hidden',
	variants: {
		variant: {
			base: 'bg-white dark:bg-neutral-800 text-black dark:text-white border',
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
		value,
		className,
		size = 'base',
		variant = 'base',
		onBlur,
		onFocus,
		onChangeText,
		...props
	},
	ref,
) {
	const [focus, setFocus] = useState(false)
	const { textColorSecondary } = useSchemeColors()
	return (
		<View className="relative">
			<TextInput
				{...props}
				ref={ref}
				value={value}
				onChangeText={onChangeText}
				placeholderTextColor={textColorSecondary}
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
			{value && (
				<TouchableOpacity
					className="absolute right-px top-px bottom-px px-3 bg-white dark:bg-neutral-800 rounded-r-lg items-center justify-center"
					onPress={() => onChangeText?.('')}
				>
					<Icon
						name="x"
						className="text-lg text-neutral-500 dark:text-neutral-400"
					/>
				</TouchableOpacity>
			)}
		</View>
	)
})
