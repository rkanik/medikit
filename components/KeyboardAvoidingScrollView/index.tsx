import { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

export const KeyboardAvoidingScrollView = ({ children }: PropsWithChildren) => {
	return (
		<KeyboardAvoidingView
			className="flex-1"
			behavior={Platform.select({
				android: 'padding',
				ios: 'height',
			})}
			// keyboardVerticalOffset={Platform.select({
			// 	android: 100,
			// 	ios: 0,
			// })}
		>
			<ScrollView
				keyboardShouldPersistTaps="always"
				contentContainerStyle={{ flexGrow: 1 }}
				automaticallyAdjustKeyboardInsets={true}
			>
				{children}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
