import {
	FlashListRef,
	FlashList as ShopifyFlashList,
} from '@shopify/flash-list'
import { RecyclerViewProps } from '@shopify/flash-list/dist/recyclerview/RecyclerViewProps'
import { styled } from 'nativewind'

export const FlashList = styled(ShopifyFlashList, {
	className: 'style',
	contentContainerClassName: 'contentContainerStyle',
}) as <T>(
	props: RecyclerViewProps<T> & { ref?: React.Ref<FlashListRef<T>> } & {
		className?: string
		contentContainerClassName?: string
	},
) => React.JSX.Element
