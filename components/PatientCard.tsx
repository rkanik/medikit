import { TPatient } from '@/types/database'
import { cn } from '@/utils/cn'
import { $d, $df } from '@/utils/dayjs'
import { GestureResponderEvent, Pressable, View } from 'react-native'
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar'
import { Card } from './ui/card'
import { Heading } from './ui/heading'
import { HStack } from './ui/hstack'
import { Text } from './ui/text'

type TPatientCardProps = {
	data: TPatient
	selected?: boolean
	className?: string
	onPress?: (e: GestureResponderEvent) => void
}

export const PatientCard = ({
	data,
	selected,
	className,
	onPress,
}: TPatientCardProps) => {
	return (
		<Pressable onPress={onPress} className={className}>
			<Card
				size="lg"
				variant="elevated"
				className={cn({
					'border-2 border-green-500': selected,
				})}
			>
				<HStack space="lg" className="items-center">
					<Avatar>
						<AvatarFallbackText>{data.name}</AvatarFallbackText>
						<AvatarImage source={{ uri: data.avatar?.uri }} />
					</Avatar>
					<View>
						<Heading size="md">{data.name}</Heading>
						{data.dob && (
							<Text>
								{$df(data.dob, 'DD MMMM, YYYY')}({$d().diff(data.dob, 'years')}{' '}
								yrs)
							</Text>
						)}
					</View>
				</HStack>
			</Card>
		</Pressable>
	)
}
