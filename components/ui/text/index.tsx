import type { PropsWithChildren } from 'react'
import type { StyleProp, TextProps, TextStyle } from 'react-native'
import { createContext, forwardRef, useContext } from 'react'
import { Text as RNText } from 'react-native'
import { cn } from 'tailwind-variants'

type TTextContext = {
	style?: StyleProp<TextStyle>
	className?: string
}

export const TextContext = createContext<TTextContext>(null!)

export const TextProvider = ({
	style,
	className,
	...props
}: PropsWithChildren<TTextContext>) => {
	return <TextContext.Provider {...props} value={{ style, className }} />
}

const createText = ({
	style: style2,
	className: className2,
	...props3
}: TextProps) => {
	return forwardRef<RNText, TextProps>(function Text(
		{ style: style3, className: className3, ...props2 },
		ref,
	) {
		const { style: style1, className: className1 } = useContext(TextContext)
		return (
			<RNText
				{...props2}
				{...props3}
				ref={ref}
				style={[style1, style2, style3]}
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
