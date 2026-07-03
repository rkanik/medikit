import type {
	TDialogCallbackChildren,
	TDialogProps,
} from '@/components/ui/dialog'
import type { ReactNode } from 'react'
import type { ViewProps } from 'react-native'
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller'

export type TBaseDialogProps = TDialogProps & {
	title?: ReactNode
	titleClassName?: string
	scrollable?: boolean
	hideHeader?: boolean
	description?: string
	descriptionClassName?: string
	headerClose?: boolean
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '6xl' | '7xl'
	headerSeparator?: boolean
	footerSeparator?: boolean
	footerClass?: string
	bodyProps?: ViewProps
	bodyClass?: string
	headerClass?: string
	trigger?: TDialogCallbackChildren
	children?: React.ReactNode
	scrollViewProps?: KeyboardAwareScrollViewProps
	FooterComponent?: React.ComponentType
}
