import { createContext, PropsWithChildren, useContext } from 'react'
import { Text as RNText, TextProps } from 'react-native'
import { cn } from 'tailwind-variants'

const Context = createContext<{
	className?: string
}>(null!)

export type TTextProviderProps = PropsWithChildren<{
	className?: string
}>
export const TextProvider = ({ className, ...props }: TTextProviderProps) => {
	return <Context.Provider {...props} value={{ className }} />
}

export type TTextProps = TextProps & {
	//
}

export const Text = ({ className, ...props }: TTextProps) => {
	const context = useContext(Context)
	return <RNText {...props} className={cn(context?.className, className)} />
}

Text.Provider = TextProvider
