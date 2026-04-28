import type { ComponentProps } from 'react'

import { useContext } from 'react'

import Feather from '@expo/vector-icons/Feather'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import Ionicons from '@expo/vector-icons/Ionicons'
import { cssInterop } from 'nativewind'
import { cn } from 'tailwind-variants'

import { TextContext } from '@/components/ui/text'

cssInterop(Feather, {
	className: {
		target: 'style',
		nativeStyleToProp: {
			//
		},
	},
})

export const IconBase = Feather

export type TIconLibrary = keyof typeof Libraries
const Libraries = {
	Feather,
	Ionicons,
	FontAwesome6,
}

export type TIconProps<Library extends TIconLibrary = 'Feather'> = {
	name: ComponentProps<(typeof Libraries)[Library]>['name']
	library?: Library
	className?: string
}

export const Icon = <Library extends TIconLibrary = 'Feather'>({
	className,
	library = 'Feather' as Library,
	...props
}: TIconProps<Library>) => {
	const context = useContext(TextContext)
	const LibraryComponent: any = Libraries[library]
	return (
		<LibraryComponent
			{...props}
			className={cn(context?.className, className)}
		/>
	)
}
