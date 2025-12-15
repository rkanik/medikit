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
			transparent: '',
		},
		size: {
			xs: 'px-2 h-8 gap-1',
			sm: 'px-3 h-9 gap-1',
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
			size: ['sm', 'base', 'xl'],
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
			transparent: '',
		},
		size: {
			xs: 'text-xs',
			sm: 'text-sm',
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
			transparent: '',
		},
		size: {
			xs: 'text-xs',
			sm: 'text-base',
			base: 'text-xl',
			xl: 'text-2xl',
		},
		icon: {
			true: '',
			false: '',
		},
	},
	compoundVariants: [
		{
			icon: true,
			size: ['sm'],
			variant: ['transparent'],
			class: 'text-xl',
		},
		{
			icon: true,
			size: ['xs'],
			variant: ['transparent'],
			class: 'text-lg',
		},
	],
	defaultVariants: {
		size: 'base',
		variant: 'base',
	},
})

const loadingSize = {
	xs: 10,
	sm: 12,
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
	const commonProps = {
		size,
		variant,
		disabled,
		icon: !!icon && !text,
	}
	const variantProps = {
		...commonProps,
		className,
	}
	return (
		<Pressable {...props} className={bv(variantProps)}>
			{loading && (
				<ActivityIndicator
					size={loadingSize[size]}
					color={scheme({
						dark: 'white',
						light: 'black',
					})}
				/>
			)}
			{icon && !loading && <Icon name={icon} className={biv(commonProps)} />}
			{text && <Text className={btv(commonProps)}>{text}</Text>}
		</Pressable>
	)
}
