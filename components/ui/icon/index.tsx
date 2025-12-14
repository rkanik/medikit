import { Feather } from '@expo/vector-icons'
import { cssInterop } from 'nativewind'
import { cn } from 'tailwind-variants'

cssInterop(Feather, {
	className: {
		target: 'style',
		nativeStyleToProp: {
			//
		},
	},
})

export type TIconProps = {
	name: any
	className?: string
}

export const Icon = ({ className, ...props }: TIconProps) => {
	return (
		<Feather
			{...props}
			className={cn('text-black dark:text-white', className)}
		/>
	)
}
