import { VariantProps } from '@gluestack-ui/utils/nativewind-utils'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { baseModalVariants } from './variants'

type TBaseModalTriggerProps = {
	onPress: () => void
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
	visible?: boolean
	title?: ReactNode
	height?: number | string
	footer?: TBaseModalFooter
	trigger?: TBaseModalTrigger
	children?: TBaseModalChildren
	className?: string
	hideClose?: boolean
	bodyClass?: string
	titleClass?: string
	headerClass?: string
	hideHeader?: boolean
	footerClass?: string
	overlayClass?: string
	hideHeaderDivider?: boolean
	scrollViewContainerStyle?: StyleProp<ViewStyle>
	wrapper?: (children: ReactNode) => ReactNode
	setVisible?: (visible: boolean) => void
}
