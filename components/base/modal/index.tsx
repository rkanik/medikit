import { useSchemeColors } from '@/hooks/useSchemeColors'
import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { createRef, Fragment, useCallback, useEffect } from 'react'

export type TBaseModalProps = React.PropsWithChildren<{
	height?: number | string
	visible?: boolean
	scrollable?: boolean
	trigger?: (v: { onPress: () => void }) => React.ReactNode
	setVisible?: (visible: boolean) => void
}>

export const BaseModal = (props: TBaseModalProps) => {
	const {
		visible,
		children,
		height = '60%',
		scrollable = true,
		trigger,
		setVisible,
	} = props
	const { backgroundColor, borderColor } = useSchemeColors()

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
					backgroundColor,
				}}
				handleIndicatorStyle={{
					backgroundColor: borderColor,
				}}
			>
				{scrollable ? (
					<BottomSheetScrollView
						nestedScrollEnabled
						keyboardShouldPersistTaps="always"
						automaticallyAdjustKeyboardInsets={true}
						contentContainerStyle={{ flexGrow: 1 }}
					>
						{children}
					</BottomSheetScrollView>
				) : (
					children
				)}
			</BottomSheetModal>
		</Fragment>
	)
}
