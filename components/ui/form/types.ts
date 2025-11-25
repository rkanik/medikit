import type { PropsWithChildren, ReactNode } from 'react'
import type { ViewProps } from 'react-native'

export type TFormInnerProps = PropsWithChildren & {
	touchable?: boolean
	blurOnPress?: boolean
}

export type TFormProps = ViewProps &
	TFormInnerProps & {
		onSubmit?: (event: any) => void
	}

export type TFormRef = {
	submit: TFormProps['onSubmit']
}

export type TFormSubmitProps = {
	loading?: boolean
	disabled?: boolean
	children: (props?: {
		loading?: boolean
		disabled?: boolean
		onPress?: TFormProps['onSubmit']
	}) => ReactNode
}
