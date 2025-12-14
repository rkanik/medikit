import { Feather } from '@expo/vector-icons'
import { cssInterop } from 'nativewind'
import { useContext } from 'react'
import { cn } from 'tailwind-variants'
import { TextContext } from '../text'

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
	const context = useContext(TextContext)
	return (
		<Feather
			{...props}
			className={cn(
				'text-black dark:text-white',
				context?.className,
				className,
			)}
		/>
	)
}
