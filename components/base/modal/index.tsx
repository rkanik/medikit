import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { CloseIcon, Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useScheme } from '@/hooks/useScheme'
import { cn } from '@gluestack-ui/utils/nativewind-utils'
import type { BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet'
import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import {
	createContext,
	createRef,
	forwardRef,
	Fragment,
	useCallback,
	useContext,
	useEffect,
} from 'react'
import { View } from 'react-native'
import { neutral } from 'tailwindcss/colors'
import type { TBaseModalProps } from './types'
import { useModal } from './useModal'

type TBaseModalContext = TBaseModalProps & {
	onClose: () => void | undefined
}

const BaseModalContext = createContext<TBaseModalContext>(null!)
const useBaseModal = () => {
	const context = useContext(BaseModalContext)
	if (!context) {
		throw new Error('useBaseModal must be used within a BaseModal')
	}
	return context
}

const BaseModalHeader = () => {
	const {
		onClose,
		title,
		height,
		headerClass,
		hideClose,
		titleClass,
		hideHeaderDivider,
	} = useBaseModal()
	return (
		<Fragment>
			<View
				className={cn(
					'flex-row items-center justify-between px-4 py-0',
					{
						'pt-12': height === '100%',
					},
					headerClass,
				)}
			>
				<View className="flex-1 flex-row items-center">
					<Text className={cn('text-xl font-medium', titleClass)}>{title}</Text>
				</View>
				{!hideClose && (
					<Button size="xs" variant="link" onPress={onClose}>
						<Icon as={CloseIcon} size="xl" />
					</Button>
				)}
			</View>
			{!hideHeaderDivider && (
				<Divider className="mt-2 bg-neutral-100 dark:bg-neutral-700" />
			)}
		</Fragment>
	)
}

const BaseModalContent = ({ children }: React.PropsWithChildren) => {
	return children
}

const BaseModalBody = forwardRef<
	BottomSheetScrollViewMethods,
	React.PropsWithChildren
>(function BaseModalBody({ children }, ref) {
	const { bodyClass, scrollViewContainerStyle } = useBaseModal()
	return (
		<BottomSheetScrollView
			ref={ref}
			nestedScrollEnabled
			contentContainerStyle={scrollViewContainerStyle}
			keyboardShouldPersistTaps="always"
			automaticallyAdjustKeyboardInsets={true}
		>
			<View className={cn('px-4 pb-8 pt-4', bodyClass)}>{children}</View>
		</BottomSheetScrollView>
	)
})

const BaseModalOverlay = ({ children }: React.PropsWithChildren) => {
	return children
}

const BaseModalFooter = ({ children }: React.PropsWithChildren) => {
	const { footerClass } = useBaseModal()
	return (
		<Fragment>
			<Divider />
			<View className={cn('flex-row justify-end p-4 pb-8', footerClass)}>
				{children}
			</View>
		</Fragment>
	)
}

const BaseModal = (props: TBaseModalProps) => {
	const {
		visible,
		trigger,
		children,
		footer,
		hideHeader,
		height = '75%',
		wrapper = v => v,
		setVisible,
	} = props
	//
	const { scheme } = useScheme()
	const ref = createRef<BottomSheetModal>()

	const onPress = useCallback(() => ref.current?.present(), [ref])
	const onClose = useCallback(() => ref.current?.dismiss(), [ref])

	const { iTrigger, iChildren, iFooter } = useModal({
		trigger,
		children,
		footer,
		onClose,
		onPress,
	})

	useEffect(() => {
		if (typeof visible === 'boolean') {
			if (visible) onPress()
			else onClose()
		}
	}, [visible, onPress, onClose])

	//
	return (
		<Fragment>
			{iTrigger}
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
				{wrapper(
					<BaseModalContext.Provider value={{ ...props, onClose }}>
						<BaseModalOverlay>
							<BaseModalContent>
								{!hideHeader && <BaseModalHeader />}
								<BaseModalBody>{iChildren}</BaseModalBody>
								{iFooter && <BaseModalFooter>{iFooter}</BaseModalFooter>}
							</BaseModalContent>
						</BaseModalOverlay>
					</BaseModalContext.Provider>,
				)}
			</BottomSheetModal>
		</Fragment>
	)
}
BaseModal.OverLay = BaseModalOverlay
BaseModal.Header = BaseModalHeader
BaseModal.Content = BaseModalContent
BaseModal.Body = BaseModalBody
BaseModal.Footer = BaseModalFooter

export { BaseModal }
