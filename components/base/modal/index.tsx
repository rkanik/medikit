import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { createRef, Fragment, useCallback, useEffect } from 'react'

import { remapProps } from 'nativewind'

remapProps(BottomSheetModal, {
	className: 'backgroundStyle',
	indicatorClassName: 'handleIndicatorStyle',
})

export type TBaseModalProps = React.PropsWithChildren<{
	height?: number | string
	visible?: boolean
	trigger?: (v: { onPress: () => void }) => React.ReactNode
	setVisible?: (visible: boolean) => void
}>

export const BaseModal = ({
	visible,
	children,
	height = '60%',
	trigger,
	setVisible,
}: TBaseModalProps) => {
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
				className="bg-neutral-100 dark:bg-neutral-700"
				indicatorClassName="bg-neutral-200 dark:bg-neutral-500"
				onChange={v => {
					if (v === 0) return onClose()
					setVisible?.(v > -1)
				}}
			>
				<BottomSheetScrollView
					nestedScrollEnabled
					keyboardShouldPersistTaps="always"
					automaticallyAdjustKeyboardInsets={true}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					{children}
				</BottomSheetScrollView>
			</BottomSheetModal>
		</Fragment>
	)
}
