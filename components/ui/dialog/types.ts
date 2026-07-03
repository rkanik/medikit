import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { DialogProps } from '@radix-ui/react-dialog'

export type TDialogCallbackChildrenProps = {
	onPress: () => void
}

export type TDialogCallbackChildren =
	| React.ReactNode
	| ((v: TDialogCallbackChildrenProps) => React.ReactNode)

export type TDialogTriggerProps = {
	asChild?: boolean
	render?: TDialogCallbackChildren
	children?: TDialogCallbackChildren
}

export type TDialogCloseProps = {
	asChild?: boolean
	render?: TDialogCallbackChildren
	children?: TDialogCallbackChildren
}

export type TDialogProps = DialogProps & {
	height?: string | number
	heightOnKeyboard?: string | number
}

export type TDialogContext = Omit<TDialogProps, 'children'> & {
	nativeRef: React.RefObject<BottomSheetModal | null>
}
