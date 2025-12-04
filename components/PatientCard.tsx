import { TPatient } from '@/types/database'
import { cn } from '@/utils/cn'
import { $d, $df } from '@/utils/dayjs'
import { GestureResponderEvent, View } from 'react-native'
import { BaseCard } from './base/card'
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar'
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
		<BaseCard
			onPress={onPress}
			className={cn('p-5', className, {
				'border-green-500 dark:border-green-500': selected,
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
		</BaseCard>
	)
}
