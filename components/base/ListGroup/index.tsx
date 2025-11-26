import { Text } from '@/components/ui/text'
import { PropsWithChildren } from 'react'
import { View } from 'react-native'

export type TListGroupProps = PropsWithChildren<{
	title: string
}>

export const ListGroup = ({ title, children }: TListGroupProps) => {
	return (
		<View>
			<Text className="uppercase text-sm tracking-wide ml-4">{title}</Text>
			<View className="dark:bg-neutral-900 rounded-lg mt-2 overflow-hidden">
				{children}
			</View>
		</View>
	)
}
