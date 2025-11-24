import { VariantProps } from '@gluestack-ui/utils/nativewind-utils'
import type { ReactNode } from 'react'
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native'
import type { baseModalVariants } from './variants'

export type TBaseModalHeaderProps = {
	title: ReactNode
	titleImage?: ImageSourcePropType // Update this type
	onClose: () => void
	className?: string
	titleClass?: string
	hideClose?: boolean
	hideDivider?: boolean
	isFullHeight?: boolean
}

export type TBaseModalContentProps = {
	children: ReactNode
	className?: string
}

export type TBaseModalBodyProps = {
	children: ReactNode
	className?: string
	scrollViewContainerStyle?: StyleProp<ViewStyle>
}

export type TBaseModalOverlayProps = {
	children: ReactNode
	className?: string
	onClose?: () => void
}

export type TBaseModalFooterProps = {
	children: ReactNode
	className?: string
}

type TBaseModalTriggerProps = {
	onPress: () => void
}

type TBaseModalRenderProps = {
	onClose: () => void
	headerProps: TBaseModalHeaderProps
	contentProps: {
		className?: string
	}
}

type TBaseModalChildrenProps = {
	close: () => void
}

type TBaseModalFooterRenderProps = {
	close: () => void
}

type TBaseModalTrigger =
	| ReactNode
	| ((props: TBaseModalTriggerProps) => ReactNode)

type TBaseModalChildren =
	| ReactNode
	| ((props: TBaseModalChildrenProps) => ReactNode)

type TBaseModalFooter =
	| ReactNode
	| ((props: TBaseModalFooterRenderProps) => ReactNode)

export type TBaseModalProps = VariantProps<typeof baseModalVariants> & {
	//
	visible?: boolean
	onChangeVisible?: (visible: boolean) => void
	//
	title?: ReactNode
	titleImage?: ImageSourcePropType
	footer?: TBaseModalFooter
	trigger?: TBaseModalTrigger
	children?: TBaseModalChildren
	render?: (props: TBaseModalRenderProps) => ReactNode
	//
	className?: string
	hideClose?: boolean
	bodyClass?: string
	titleClass?: string
	headerClass?: string
	hideHeader?: boolean
	hideHeaderDivider?: boolean
	scrollViewContainerStyle?: StyleProp<ViewStyle>
	overlayClass?: string
	footerClass?: string
	height?: number | string
}
