import type { TButtonProps, TButtonVariants } from '@/components/ui/button'
import type { TIconProps } from '@/components/ui/icon'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { useButtonForegroundVariants } from '@/components/ui/button/useButtonForegroundVariants'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

type TButtonSpinnerProps = Pick<TButtonVariants, 'variant'>
const ButtonSpinner = (props: TButtonSpinnerProps) => {
	const color = useButtonForegroundVariants(props)
	return (
		<View className="absolute inset-0 items-center justify-center">
			<Spinner color={color} />
		</View>
	)
}

export type TBaseButtonProps = Pick<
	TButtonProps,
	| 'size'
	| 'variant'
	| 'className'
	| 'style'
	| 'onPress'
	| 'pill'
	| 'onLongPress'
> & {
	title?: React.ReactNode
	titleClassName?: string
	append?: React.ReactNode
	prepend?: React.ReactNode
	prependIcon?: TIconProps['name']
	prependIconLibrary?: TIconProps['library']
	prependIconClassName?: string
	appendIcon?: TIconProps['name']
	appendIconLibrary?: TIconProps['library']
	appendIconClassName?: string
	loading?: boolean
	disabled?: boolean
	badge?: boolean
	wrapperClassName?: string
}

export const BaseButton = ({
	size,
	pill,
	badge,
	title,
	append,
	prepend,
	loading,
	variant,
	disabled,
	className,
	appendIcon,
	prependIcon,
	titleClassName,
	wrapperClassName,
	prependIconLibrary,
	prependIconClassName,
	appendIconClassName,
	appendIconLibrary,
	...props
}: TBaseButtonProps) => {
	return (
		<View className={cn('relative', wrapperClassName)}>
			<Button
				{...props}
				size={size}
				pill={pill}
				variant={variant}
				disabled={disabled || loading}
				className={className}
			>
				{prepend}
				{prependIcon && (
					<Icon
						name={prependIcon}
						library={prependIconLibrary}
						className={prependIconClassName}
					/>
				)}
				{title && typeof title === 'string' ? (
					<Text className={titleClassName}>{title}</Text>
				) : (
					title
				)}
				{append}
				{appendIcon && (
					<Icon
						name={appendIcon}
						library={appendIconLibrary}
						className={appendIconClassName}
					/>
				)}
			</Button>
			{loading && <ButtonSpinner variant={variant} />}
			{badge && (
				<View className="absolute -right-1 top-1 h-3 w-3 items-center justify-center rounded-full bg-primary" />
			)}
		</View>
	)
}
