import { Text } from '@/components/ui/text'
import { TMaybe } from '@/types'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, ViewProps } from 'react-native'
import { cn, tv, VariantProps } from 'tailwind-variants'

const avatarVariants = tv({
	base: 'w-12 h-12 rounded-full items-center overflow-hidden justify-center',
	variants: {
		variant: {
			primary:
				'bg-white border border-white dark:bg-neutral-700 dark:border-neutral-700',
			secondary:
				'bg-neutral-200 border border-neutral-200 dark:bg-black dark:border-black',
		},
	},
	defaultVariants: {
		variant: 'primary',
	},
})

export type TAvatarProps = ViewProps &
	VariantProps<typeof avatarVariants> & {
		text?: TMaybe<string>
		textClassName?: string
		image?: TMaybe<string>
		imageClassName?: string
	}

export const Avatar = ({
	text,
	image,
	variant,
	className,
	textClassName,
	imageClassName,
	...props
}: TAvatarProps) => {
	const [error, setError] = useState(false)
	const shouldShowText = text && (!image || error)
	return (
		<Pressable {...props} className={avatarVariants({ variant, className })}>
			{shouldShowText && (
				<Text className={cn('uppercase text-base font-bold', textClassName)}>
					{text
						.split(' ')
						.map(v => v[0])
						.slice(0, 2)
						.join('')}
				</Text>
			)}
			{image && (
				<Image
					source={{ uri: image }}
					style={{ height: '100%', width: '100%' }}
					className={imageClassName}
					contentFit="cover"
					contentPosition="center"
					onError={() => setError(true)}
				/>
			)}
		</Pressable>
	)
}
