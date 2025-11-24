import {
	BottomSheet,
	BottomSheetBackdrop,
	BottomSheetContent,
	BottomSheetDragIndicator,
	BottomSheetPortal,
	BottomSheetTrigger,
} from '@/components/ui/bottomsheet'
import { Text } from '@/components/ui/text'
import { useScheme } from '@/hooks/useScheme'

type TBaseDialogProps = React.PropsWithChildren<{
	height?: number | string
	trigger?: React.ReactNode
}>

export const BaseDialog = ({
	children,
	trigger,
	height = '60%',
}: TBaseDialogProps) => {
	const { scheme } = useScheme()
	return (
		<BottomSheet>
			<BottomSheetTrigger>
				{trigger || <Text>Open BottomSheet</Text>}
			</BottomSheetTrigger>
			<BottomSheetPortal
				snapPoints={[1, height]}
				backdropComponent={BottomSheetBackdrop}
				handleComponent={BottomSheetDragIndicator}
				containerStyle={{
					zIndex: 999,
					backgroundColor: scheme({
						dark: 'neutral-700',
						light: 'white',
					}),
				}}
			>
				<BottomSheetContent className="bg-white dark:bg-neutral-700 p-4">
					{children}
				</BottomSheetContent>
			</BottomSheetPortal>
		</BottomSheet>
	)
}
