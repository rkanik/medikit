import { createContext, useCallback, useContext, useState } from 'react'
import { LayoutChangeEvent, View, ViewProps, ViewStyle } from 'react-native'
import { cn } from 'tailwind-variants'

export type TGridProps = ViewProps & {
	gap?: number
	cols?: number
}

type TContext = {
	style: (v?: { colSpan?: number }) => ViewStyle
}

const Context = createContext<TContext>(null!)

export const Grid = ({ gap = 0, cols = 1, children, ...props }: TGridProps) => {
	const [width, setWidth] = useState(0)
	const onLayout = useCallback((event: LayoutChangeEvent) => {
		setWidth(event.nativeEvent.layout.width)
	}, [])
	const style: TContext['style'] = useCallback(
		v => {
			const colSpan = Math.min(v?.colSpan || 1, cols)
			return {
				width:
					Math.floor((width - gap * cols) / cols) * colSpan +
					(colSpan > 1 ? gap * (colSpan - 1) : 0),
				marginTop: gap,
				marginLeft: gap,
			}
		},
		[gap, cols, width],
	)
	return (
		<Context.Provider value={{ style }}>
			<View {...props}>
				<View
					style={{ marginLeft: -gap, marginTop: -gap }}
					onLayout={onLayout}
					className="flex-row flex-wrap"
				>
					{children}
				</View>
			</View>
		</Context.Provider>
	)
}

export type TGridItemProps = ViewProps & {
	colSpan?: number
}

export const GridItem = ({ className, colSpan, ...props }: TGridItemProps) => {
	const { style } = useContext(Context)
	return (
		<View
			{...props}
			style={[props.style, style({ colSpan })]}
			className={cn(className, 'flex-none')}
		/>
	)
}
