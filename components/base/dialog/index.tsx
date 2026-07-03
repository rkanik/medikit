import type { TBaseDialogProps } from './types'
import { Fragment, useMemo } from 'react'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import {
	Dialog,
	DialogBody,
	DialogBodyScrollable,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { BaseButton } from '../button'

export * from './types'
export const BaseDialog = ({
	title,
	titleClassName,
	trigger,
	children,
	bodyProps,
	hideHeader,
	description,
	descriptionClassName,
	headerClose,
	bodyClass,
	headerClass,
	footerClass,
	headerSeparator,
	footerSeparator,
	scrollViewProps,
	FooterComponent,
	scrollable = true,
	...props
}: TBaseDialogProps) => {
	const body = useMemo(() => {
		const props = {
			...bodyProps,
			className: cn(bodyClass, bodyProps?.className),
		}
		if (scrollable) {
			return (
				<DialogBodyScrollable {...scrollViewProps}>
					<DialogBody {...props}>{children}</DialogBody>
				</DialogBodyScrollable>
			)
		}
		return <DialogBody {...props}>{children}</DialogBody>
	}, [children, scrollable, bodyProps, bodyClass, scrollViewProps])
	return (
		<Dialog {...props}>
			<DialogTrigger asChild render={trigger} />
			<DialogContent>
				{!hideHeader && (
					<Fragment>
						<DialogHeader
							className={cn('flex-row justify-between pb-2', headerClass)}
						>
							<View className="flex-1">
								{title && (
									<DialogTitle className={titleClassName}>{title}</DialogTitle>
								)}
								{description && (
									<DialogDescription className={descriptionClassName}>
										{description}
									</DialogDescription>
								)}
							</View>
							{headerClose && (
								<DialogClose
									render={v => (
										<BaseButton
											{...v}
											pill
											size="icon-xs"
											variant="ghost"
											prependIcon="x"
											prependIconClassName="text-xl text-card-foreground"
										/>
									)}
								/>
							)}
						</DialogHeader>
						{headerSeparator && <Separator />}
					</Fragment>
				)}
				{body}
				{footerSeparator && <Separator />}
				{FooterComponent && (
					<DialogFooter className={footerClass}>
						<FooterComponent />
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	)
}
