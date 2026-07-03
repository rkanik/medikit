import type {
	DialogContentProps,
	DialogOverlayProps,
	DialogPortalProps,
} from '@radix-ui/react-dialog'
import type { TextProps, ViewProps } from 'react-native'
import type {
	TDialogCloseProps,
	TDialogProps,
	TDialogTriggerProps,
} from './types'

import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Keyboard, View } from 'react-native'

import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { cssInterop } from 'nativewind'
import { cn } from 'tailwind-variants'

import { Text } from '@/components/ui/text'

import { DialogContext, useDialog } from './context'

cssInterop(BottomSheetModal, {
	className: {
		target: 'backgroundStyle',
	},
	indicatorClassName: {
		target: 'handleIndicatorStyle',
	},
})

function Dialog({ children, ...value }: TDialogProps) {
	const nativeRef = useRef<BottomSheetModal>(null)
	return (
		<DialogContext.Provider value={{ ...value, nativeRef }}>
			{children}
		</DialogContext.Provider>
	)
}

function DialogTriggerInner({
	method,
	render,
	children,
}: TDialogTriggerProps & {
	method: 'present' | 'dismiss'
}) {
	const { nativeRef, onOpenChange } = useDialog()
	const onPress = useCallback(() => {
		nativeRef.current?.[method]()
		onOpenChange?.(method === 'present')
	}, [nativeRef, method, onOpenChange])
	return useMemo(() => {
		const v = render || children
		if (typeof v === 'function') {
			return v({ onPress })
		}
		return v
	}, [render, children, onPress])
}

function DialogTrigger(props: TDialogTriggerProps) {
	return <DialogTriggerInner {...props} method="present" />
}

function DialogPortal({ children }: DialogPortalProps) {
	return <React.Fragment>{children}</React.Fragment>
}

function DialogClose(props: TDialogCloseProps) {
	return <DialogTriggerInner {...props} method="dismiss" />
}

function DialogOverlay({ children }: DialogOverlayProps) {
	return <React.Fragment>{children}</React.Fragment>
}

function DialogContent({ children, className }: DialogContentProps) {
	const context = useDialog()

	const {
		open,
		nativeRef,
		defaultOpen,
		height = '60%',
		heightOnKeyboard = height,
		onOpenChange,
	} = context

	useEffect(() => {
		if (open === undefined) return
		if (open) nativeRef.current?.present()
		else nativeRef.current?.dismiss()
	}, [open, nativeRef])

	useEffect(() => {
		if (defaultOpen) {
			nativeRef.current?.present()
		}
	}, [defaultOpen, nativeRef])

	useEffect(() => {
		Keyboard.addListener('keyboardDidShow', () => {
			nativeRef.current?.snapToIndex(2)
		})
		Keyboard.addListener('keyboardDidHide', () => {
			nativeRef.current?.snapToIndex(1)
		})
	}, [nativeRef])

	return (
		<DialogPortal>
			<DialogOverlay />
			<BottomSheetModal
				ref={nativeRef}
				index={1}
				topInset={0}
				enableDismissOnClose
				enablePanDownToClose
				snapPoints={[1, height, heightOnKeyboard]}
				stackBehavior="push"
				keyboardBehavior="extend"
				enableDynamicSizing={false}
				backdropComponent={BottomSheetBackdrop}
				// @ts-expect-error
				className={cn('bg-card', className)}
				indicatorClassName="bg-border"
				onDismiss={() => onOpenChange?.(false)}
				onChange={v => {
					if (v > 0) return
					nativeRef.current?.dismiss()
				}}
			>
				<DialogContext.Provider value={context}>
					{children}
				</DialogContext.Provider>
			</BottomSheetModal>
		</DialogPortal>
	)
}

function DialogHeader({ className, ...props }: ViewProps) {
	return <View className={cn('px-4', className)} {...props} />
}

function DialogBody({ className, ...props }: ViewProps) {
	return <View className={cn('flex-1 p-4', className)} {...props} />
}

const DialogBodyScrollable = BottomSheetScrollView
// const DialogBodyScrollable = KeyboardAwareScrollViewDialog

function DialogFooter({ className, ...props }: ViewProps) {
	return <View className={cn('px-4 pb-8 pt-4', className)} {...props} />
}

function DialogTitle({ className, children, ...props }: TextProps) {
	if (typeof children !== 'string') return children
	return (
		<Text className={cn('text-lg font-semibold', className)} {...props}>
			{children}
		</Text>
	)
}

function DialogDescription({ className, ...props }: TextProps) {
	return (
		<Text
			className={cn('text-sm text-secondary-foreground', className)}
			{...props}
		/>
	)
}

export * from './types'

export {
	Dialog,
	DialogBody,
	DialogBodyScrollable,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
	useDialog,
}
