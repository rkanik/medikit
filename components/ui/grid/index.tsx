import { Pressable, ViewProps } from 'react-native'
import { cn } from 'tailwind-variants'

type TGridProps = ViewProps & {
	_extra?: {
		className?: string
	}
}

export const Grid = ({ className, ...props }: TGridProps) => {
	return <Pressable {...props} className={cn('', className)} />
}

type TGridItemProps = ViewProps & {
	_extra?: {
		className?: string
	}
}

export const GridItem = ({ className, ...props }: TGridItemProps) => {
	return <Pressable {...props} className={cn('', className)} />
}
