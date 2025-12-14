import { Text } from '@/components/ui/text'
import { useScheme } from '@/hooks/useScheme'
import { ActivityIndicator, PressableProps } from 'react-native'
import { tv, VariantProps } from 'tailwind-variants'
import { Icon } from '../icon'
import { Pressable } from '../pressable'

const bv = tv({
	base: 'flex-row items-center justify-center overflow-hidden rounded-full',
	variants: {
		variant: {
			base: 'bg-green-300 dark:bg-neutral-700',
			base2: 'bg-neutral-400 dark:bg-neutral-800',
		},
		size: {
			base: 'px-4 h-12 gap-2',
			xl: 'px-6 h-20 gap-3',
		},
		disabled: {
			true: 'opacity-50',
		},
		icon: {
			true: '',
			false: '',
		},
	},
	compoundVariants: [
		{
			icon: true,
			size: ['base', 'xl'],
			class: 'aspect-square p-0',
		},
	],
	defaultVariants: {
		size: 'base',
		variant: 'base',
		disabled: false,
	},
})

const btv = tv({
	base: '',
	variants: {
		variant: {
			base: 'text-black dark:text-white',
			base2: 'text-black dark:text-white',
		},
		size: {
			base: 'text-base',
			xl: 'text-2xl',
		},
	},
	defaultVariants: {
		size: 'base',
		variant: 'base',
	},
})

const biv = tv({
	base: '',
	variants: {
		variant: {
			base: 'text-black dark:text-white',
			base2: 'text-black dark:text-white',
		},
		size: {
			base: 'text-xl',
			xl: 'text-2xl',
		},
	},
	defaultVariants: {
		size: 'base',
		variant: 'base',
	},
})

const loadingSize = {
	base: 16,
	xl: 20,
} as const

export type TButtonProps = Omit<PressableProps, 'children'> &
	Omit<VariantProps<typeof bv>, 'icon'> & {
		icon?: string
		text?: string
		loading?: boolean
	}

export const Button = ({
	icon,
	text,
	loading,
	disabled,
	className,
	size = 'base',
	variant = 'base',
	...props
}: TButtonProps) => {
	const { scheme } = useScheme()
	return (
		<Pressable
			{...props}
			className={bv({
				size,
				variant,
				className,
				disabled,
				icon: !!icon && !text,
			})}
		>
			{loading && (
				<ActivityIndicator
					size={loadingSize[size]}
					color={scheme({
						dark: 'white',
						light: 'black',
					})}
				/>
			)}
			{icon && !loading && (
				<Icon
					name={icon}
					className={biv({
						size,
						variant,
					})}
				/>
			)}
			{text && (
				<Text
					className={btv({
						size,
						variant,
					})}
				>
					{text}
				</Text>
			)}
		</Pressable>
	)
}
