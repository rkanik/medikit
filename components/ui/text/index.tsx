import { createContext, forwardRef, PropsWithChildren, useContext } from 'react'
import { Text as RNText, TextProps } from 'react-native'
import { cn } from 'tailwind-variants'

type TTextContext = {
	className?: string
}

export const TextContext = createContext<TTextContext>(null!)

export const TextProvider = ({
	className,
	...props
}: PropsWithChildren<TTextContext>) => {
	return <TextContext.Provider {...props} value={{ className }} />
}

const createText = ({ className: className2, ...props3 }: TextProps) => {
	return forwardRef<RNText, TextProps>(function Text(
		{ className: className3, ...props2 },
		ref,
	) {
		const { className: className1 } = useContext(TextContext)
		return (
			<RNText
				{...props2}
				{...props3}
				ref={ref}
				className={cn(className1, className2, className3)}
			/>
		)
	})
}

export const Text = createText({})

export const Title = createText({
	className: 'text-lg font-semibold',
})

export const Subtitle = createText({
	className: 'text-base opacity-70 dark:opacity-80',
})

export const Body = createText({
	className: 'text-base opacity-60 dark:opacity-70',
})
