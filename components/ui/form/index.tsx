import {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useImperativeHandle,
	useRef,
} from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import type {
	TFormInnerProps,
	TFormProps,
	TFormRef,
	TFormSubmitProps,
} from './types'

const Context = createContext<
	Pick<TFormProps, 'onSubmit'> & {
		blur: () => void
		onFocus: (event?: any) => void
		currentFocused: React.RefObject<any>
	}
>(null!)

export const useCurrentForm = () => {
	return useContext(Context)
}

const FormInner = ({ children, touchable, blurOnPress }: TFormInnerProps) => {
	const v = touchable ?? true
	const form = useCurrentForm()
	if (!v) return <View className="flex-1">{children}</View>
	return (
		<TouchableWithoutFeedback
			disabled={!(blurOnPress ?? true)}
			onPress={form?.blur}
			className="flex-1"
		>
			{children}
		</TouchableWithoutFeedback>
	)
}
export const Form = forwardRef<TFormRef, TFormProps>(function Form(
	{ children, touchable, blurOnPress, onSubmit, ...rest },
	ref,
) {
	const currentFocused = useRef<any>(null)

	const blur = useCallback(() => {
		Keyboard.dismiss()
		if (typeof currentFocused.current?.blur === 'function') {
			currentFocused.current?.blur?.()
		}
	}, [])

	// const scrollViewRef = useCurrentScrollView()
	const onFocus = useCallback((event: any) => {
		currentFocused.current = event?.target
		// if (
		// 	scrollViewRef &&
		// 	typeof scrollViewRef.current?.scrollTo === 'function' &&
		// 	event?.target?.measure
		// ) {
		// 	event.target.measure?.(
		// 		(
		// 			x: number,
		// 			y: number,
		// 			width: number,
		// 			height: number,
		// 			pageX: number,
		// 			pageY: number,
		// 		) => {
		// 			scrollViewRef.current?.scrollTo({
		// 				y: pageY - 100, // offset to reveal above keyboard, adjust as needed
		// 				animated: true,
		// 			})
		// 		},
		// 	)
		// }
	}, [])

	useImperativeHandle(ref, () => ({
		submit: onSubmit,
	}))

	return (
		<Context.Provider
			value={{
				blur,
				onFocus,
				onSubmit,
				currentFocused,
			}}
		>
			<FormInner touchable={touchable} blurOnPress={blurOnPress}>
				<View {...rest}>{children}</View>
			</FormInner>
		</Context.Provider>
	)
})

export const FormSubmit = ({
	loading,
	disabled,
	children,
}: TFormSubmitProps) => {
	const { onSubmit } = useContext(Context)
	return children({
		loading,
		disabled,
		onPress: onSubmit,
	})
}
