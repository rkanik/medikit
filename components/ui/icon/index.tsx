import { useScheme } from '@/hooks/useScheme'
import { Feather } from '@expo/vector-icons'
import { cn } from 'tailwind-variants'

export type TIconProps = {
	name: any
	size?: number
	color?: string
	className?: string
}

export const Icon = ({ className, size, ...props }: TIconProps) => {
	const { scheme } = useScheme()
	return (
		<Feather
			{...props}
			// size={size}
			// color={scheme({
			// 	dark: colors.white,
			// 	light: colors.black,
			// })}
			className={cn('text-black dark:text-white', className)}
		/>
	)
}
