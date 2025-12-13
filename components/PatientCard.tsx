import { TPatient } from '@/types/database'
import { $d, $df } from '@/utils/dayjs'
import { GestureResponderEvent, View } from 'react-native'
import { cn } from 'tailwind-variants'
import { BaseCard } from './base/card'
import { Avatar } from './ui/avatar'
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
			<View className="items-center gap-2">
				<Avatar>
					<Avatar.Text>{data.name}</Avatar.Text>
					<Avatar.Image source={{ uri: data.avatar?.uri }} />
				</Avatar>
				<View>
					<Text size="md">{data.name}</Text>
					{data.dob && (
						<Text>
							{$df(data.dob, 'DD MMMM, YYYY')}({$d().diff(data.dob, 'years')}{' '}
							yrs)
						</Text>
					)}
				</View>
			</View>
		</BaseCard>
	)
}
