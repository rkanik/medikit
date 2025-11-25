import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
} from '@/components/ui/bottomsheet'
import { useScheme } from '@/hooks/useScheme'
import { createRef, Fragment, useCallback, useEffect } from 'react'
import { neutral } from 'tailwindcss/colors'

export type TBaseDialogTriggerProps = {
	onPress: () => void
}

export type TBaseDialogTrigger = (
	props: TBaseDialogTriggerProps,
) => React.ReactNode

export type TBaseDialogProps = React.PropsWithChildren<{
	height?: number | string
	visible?: boolean
	trigger?: TBaseDialogTrigger
	setVisible?: (visible: boolean) => void
}>

export const BaseDialog = (props: TBaseDialogProps) => {
	const { children, visible, height = '60%', trigger, setVisible } = props
	const { scheme } = useScheme()

	const ref = createRef<BottomSheetModal>()

	const onPress = useCallback(() => ref.current?.present(), [ref])
	const onClose = useCallback(() => ref.current?.dismiss(), [ref])

	useEffect(() => {
		if (typeof visible === 'boolean') {
			if (visible) onPress()
			else onClose()
		}
	}, [visible, onPress, onClose])

	return (
		<Fragment>
			{trigger && trigger({ onPress })}
			<BottomSheetModal
				ref={ref}
				index={1}
				topInset={0}
				enableDismissOnClose
				enablePanDownToClose
				snapPoints={[1, height]}
				enableDynamicSizing={false}
				backdropComponent={BottomSheetBackdrop}
				onChange={v => {
					if (v === 0) return onClose()
					setVisible?.(v > -1)
				}}
				backgroundStyle={{
					backgroundColor: scheme({
						dark: neutral[800],
						light: 'white',
					}),
				}}
				handleIndicatorStyle={{
					backgroundColor: scheme({
						dark: neutral[600],
						light: '',
					}),
				}}
			>
				<BottomSheetScrollView
					nestedScrollEnabled
					keyboardShouldPersistTaps="always"
					automaticallyAdjustKeyboardInsets={true}
				>
					{children}
				</BottomSheetScrollView>
			</BottomSheetModal>
		</Fragment>
	)
}
