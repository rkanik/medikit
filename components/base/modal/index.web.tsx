import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useMemoState } from '@/hooks/useMemoState'
import { isWeb } from '@/utils/is'
import { cn } from '@gluestack-ui/utils/nativewind-utils'
import { useCallback, useMemo } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import type {
	TBaseModalBodyProps,
	TBaseModalContentProps,
	TBaseModalFooterProps,
	TBaseModalHeaderProps,
	TBaseModalOverlayProps,
	TBaseModalProps,
} from './types'
import { useModal } from './useModal'
import { baseModalVariants } from './variants'

const BaseModalHeader = ({
	title,
	className,
	hideClose,
	titleClass,
	hideDivider,
	onClose,
}: TBaseModalHeaderProps) => {
	return (
		<View
			className={cn(
				'flex-none flex-row items-center justify-between px-4 py-3',
				className,
				{
					'border-b border-b-neutral-200': !hideDivider,
				},
			)}
		>
			<Text className={cn('text-lg font-medium', titleClass)}>{title}</Text>
			{!hideClose && (
				<Pressable onPress={onClose}>
					<Button size="xs" variant="solid">
						<Text>Close</Text>
					</Button>
				</Pressable>
			)}
		</View>
	)
}

const BaseModalContent = ({ children, className }: TBaseModalContentProps) => {
	return <View className={className}>{children}</View>
}

const BaseModalBody = ({ children, className }: TBaseModalBodyProps) => {
	return (
		<ScrollView nestedScrollEnabled>
			<View className={cn('p-4', className)}>{children}</View>
		</ScrollView>
	)
}

const BaseModalOverlay = ({
	children,
	className,
	onClose,
}: TBaseModalOverlayProps) => {
	return (
		<Pressable
			className={cn(
				'h-screen items-center justify-center overflow-hidden bg-[rgba(0,0,0,0.5)]',
				{
					'p-4': !isWeb,
					'p-4 pb-36 sm:pb-4': isWeb,
				},
				className,
			)}
			onPress={event => {
				if (event.target === event.currentTarget) {
					onClose?.()
				}
			}}
		>
			{children}
		</Pressable>
	)
}

const BaseModalFooter = ({ children, className }: TBaseModalFooterProps) => {
	return (
		<View className={cn('border-t border-t-neutral-200 p-3', className)}>
			{children}
		</View>
	)
}

const BaseModal = ({
	title,
	visible,
	trigger,
	children,
	className,
	bodyClass,
	hideClose,
	titleClass,
	headerClass,
	footerClass,
	overlayClass,
	hideHeader,
	hideHeaderDivider,
	size = 'xl',
	footer,
	render,
	onChangeVisible,
}: TBaseModalProps) => {
	//
	const [innerVisible, setInnerVisible] = useMemoState(() => {
		return visible ?? false
	}, [visible])

	const onClose = useCallback(() => {
		setInnerVisible(false)
		onChangeVisible?.(false)
	}, [setInnerVisible, onChangeVisible])

	const onPress = useCallback(() => {
		setInnerVisible(true)
		onChangeVisible?.(true)
	}, [setInnerVisible, onChangeVisible])

	const { iTrigger, iChildren, iFooter } = useModal({
		trigger,
		children,
		footer,
		onClose,
		onPress,
	})

	const iClassName = useMemo(() => {
		return cn(baseModalVariants({ size, className }))
	}, [size, className])

	const headerProps = useMemo(
		() => ({
			title,
			onClose,
			hideClose,
			titleClass,
			className: headerClass,
			hideDivider: hideHeaderDivider,
		}),
		[title, hideClose, titleClass, hideHeaderDivider, headerClass, onClose],
	)

	return (
		<>
			{iTrigger}
			<Modal
				visible={innerVisible}
				className="modal"
				transparent={true}
				animationType="fade"
				onRequestClose={onClose}
			>
				{render ? (
					render({
						onClose,
						headerProps,
						contentProps: {
							className: iClassName,
						},
					})
				) : (
					<BaseModalOverlay onClose={onClose} className={overlayClass}>
						<BaseModalContent className={iClassName}>
							{!hideHeader && <BaseModalHeader {...headerProps} />}
							<BaseModalBody className={bodyClass}>{iChildren}</BaseModalBody>
							{iFooter && (
								<BaseModalFooter className={footerClass}>
									{iFooter}
								</BaseModalFooter>
							)}
						</BaseModalContent>
					</BaseModalOverlay>
				)}
			</Modal>
		</>
	)
}

BaseModal.OverLay = BaseModalOverlay
BaseModal.Header = BaseModalHeader
BaseModal.Content = BaseModalContent
BaseModal.Body = BaseModalBody
BaseModal.Footer = BaseModalFooter

export { BaseModal }
