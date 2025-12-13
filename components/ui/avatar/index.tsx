import { Text } from '@/components/ui/text'
import { Image, ImageProps } from 'expo-image'
import { Pressable, TextProps, ViewProps } from 'react-native'
import { cn } from 'tailwind-variants'

export type TAvatarProps = ViewProps & {
	size?: string
}

export const Avatar = ({ className, ...props }: TAvatarProps) => {
	return <Pressable {...props} className={cn('', className)} />
}

export type TAvatarImageProps = ImageProps & {
	//
}

export const AvatarImage = ({ className, ...props }: TAvatarImageProps) => {
	return (
		<Image {...props} className={cn('w-10 h-10 rounded-full', className)} />
	)
}

export type TAvatarTextProps = TextProps & {
	//
}

export const AvatarText = ({ className, ...props }: TAvatarTextProps) => {
	return <Text {...props} className={cn('', className)} />
}

Avatar.Text = AvatarText
Avatar.Image = AvatarImage
