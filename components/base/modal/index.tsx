import { createRef, Fragment, useCallback, useEffect } from 'react'

import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { cssInterop } from 'nativewind'

cssInterop(BottomSheetModal, {
	className: {
		target: 'backgroundStyle',
	},
	indicatorClassName: {
		target: 'handleIndicatorStyle',
	},
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
				// @ts-ignore
				className="bg-neutral-200 dark:bg-neutral-700"
				indicatorClassName="bg-neutral-400 dark:bg-neutral-500"
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
