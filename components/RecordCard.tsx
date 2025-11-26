import { TRecord } from '@/types/database'
import { $df } from '@/utils/dayjs'
import { GestureResponderEvent, Pressable, View } from 'react-native'
import { Card } from './ui/card'
import { Heading } from './ui/heading'
import { HStack } from './ui/hstack'
import { Text } from './ui/text'

type TRecordCardProps = {
	data: TRecord
	onPress?: (e: GestureResponderEvent) => void
}

export const RecordCard = ({ data, onPress }: TRecordCardProps) => {
	return (
		<Pressable className="mt-2" onPress={onPress}>
			<Card size="lg" variant="elevated">
				<HStack space="lg" className="items-center">
					{/* <Avatar>
						<AvatarFallbackText>{data.name}</AvatarFallbackText>
						<AvatarImage source={{ uri: data.avatar?.uri }} />
					</Avatar> */}
					<View>
						<Heading size="md">{data.title}</Heading>
						<Text>{data.description}</Text>
						{data.date && <Text>{$df(data.date, 'DD MMMM, YYYY')}</Text>}
					</View>
				</HStack>
			</Card>
		</Pressable>
	)
}
