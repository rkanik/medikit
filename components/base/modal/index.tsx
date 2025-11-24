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
	createRef,
	forwardRef,
	Fragment,
	useCallback,
	useEffect,
	useMemo,
} from 'react'
import { Image, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'
import type {
	TBaseModalBodyProps,
	TBaseModalContentProps,
	TBaseModalFooterProps,
	TBaseModalHeaderProps,
	TBaseModalOverlayProps,
	TBaseModalProps,
} from './types'
import { useModal } from './useModal'

const BaseModalHeader = ({
	title,
	titleImage,
	className,
	hideClose,
	titleClass,
	hideDivider,
	onClose,
	isFullHeight,
}: TBaseModalHeaderProps) => {
	return (
		<Fragment>
			<View
				className={cn(
					'flex-row items-center justify-between px-4 py-0',
					{
						'pt-12': isFullHeight,
					},
					className,
				)}
			>
				<View className="flex-1 flex-row items-center">
					{titleImage && (
						<Image
							source={titleImage}
							style={{ width: 32, height: 32 }}
							resizeMode="contain"
							className="mr-2 rounded-xl border border-gray-100"
						/>
					)}
					<Text className={cn('text-xl font-medium', titleClass)}>{title}</Text>
				</View>
				{!hideClose && (
					<Button size="xs" variant="link" onPress={onClose}>
						<Icon as={CloseIcon} size="xl" />
					</Button>
				)}
			</View>
			{!hideDivider && <Divider className="mt-2" />}
		</Fragment>
	)
}
const BaseModalContent = ({ children }: TBaseModalContentProps) => {
	return children
}

const BaseModalBody = forwardRef<
	BottomSheetScrollViewMethods,
	TBaseModalBodyProps
>(function BaseModalBody(
	{ children, className, scrollViewContainerStyle },
	ref,
) {
	return (
		<BottomSheetScrollView
			ref={ref}
			nestedScrollEnabled
			contentContainerStyle={scrollViewContainerStyle}
			keyboardShouldPersistTaps="always"
			automaticallyAdjustKeyboardInsets={true}
		>
			<View className={cn('px-4 pb-8 pt-4', className)}>{children}</View>
		</BottomSheetScrollView>
	)
})

const BaseModalOverlay = ({ children }: TBaseModalOverlayProps) => {
	return children
}

const BaseModalFooter = ({ children, className }: TBaseModalFooterProps) => {
	return (
		<Fragment>
			<Divider />
			<View className={cn('flex-row justify-end p-4 pb-8', className)}>
				{children}
			</View>
		</Fragment>
	)
}

const BaseModal = ({
	title,
	titleImage,
	visible,
	trigger,
	children,
	bodyClass,
	headerClass,
	hideHeader,
	hideHeaderDivider,
	footerClass,
	titleClass,
	hideClose,
	footer,
	scrollViewContainerStyle,
	height = '75%',
	render,
	onChangeVisible,
}: TBaseModalProps) => {
	//
	const { scheme } = useScheme()
	const ref = createRef<BottomSheetModal>()
	const isFullHeight = height === '100%'

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

	const headerProps = useMemo(
		() => ({
			title,
			titleImage,
			onClose,
			hideClose,
			titleClass,
			className: headerClass,
			hideDivider: hideHeaderDivider,
			isFullHeight,
		}),
		[
			title,
			titleImage,
			hideClose,
			titleClass,
			hideHeaderDivider,
			headerClass,
			onClose,
			isFullHeight,
		],
	)

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
					onChangeVisible?.(v > -1)
				}}
				backgroundStyle={{
					backgroundColor: scheme({
						dark: neutral[700],
						light: 'white',
					}),
				}}
			>
				{render ? (
					render({
						onClose,
						headerProps,
						contentProps: {
							className: '',
						},
					})
				) : (
					<BaseModalOverlay>
						<BaseModalContent>
							{!hideHeader && <BaseModalHeader {...headerProps} />}
							<BaseModalBody
								className={bodyClass}
								scrollViewContainerStyle={scrollViewContainerStyle}
							>
								{iChildren}
							</BaseModalBody>
							{iFooter && (
								<BaseModalFooter className={footerClass}>
									{iFooter}
								</BaseModalFooter>
							)}
						</BaseModalContent>
					</BaseModalOverlay>
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
