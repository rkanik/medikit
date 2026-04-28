import type {
	TFormInnerProps,
	TFormProps,
	TFormRef,
	TFormSubmitProps,
} from './types'
import {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useImperativeHandle,
	useRef,
} from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import { cn } from 'tailwind-variants'

export * from './types'

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
	{ children, touchable, blurOnPress, className, onSubmit, ...rest },
	ref,
) {
	const currentFocused = useRef<any>(null)

	const blur = useCallback(() => {
		Keyboard.dismiss()
		if (typeof currentFocused.current?.blur === 'function') {
			currentFocused.current?.blur?.()
		}
	}, [])

	const onFocus = useCallback((event: any) => {
		currentFocused.current = event?.target
	}, [])

	useImperativeHandle(ref, () => ({ submit: onSubmit }))

	return (
		<Context.Provider value={{ blur, onFocus, onSubmit, currentFocused }}>
			<FormInner touchable={touchable} blurOnPress={blurOnPress}>
				<View {...rest} className={cn('flex-1', className)}>
					{children}
				</View>
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
	return children({ loading, disabled, onPress: onSubmit })
}
