import type { TPatient } from '@/types/database'
import type { GestureResponderEvent } from 'react-native'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { $d, $df } from '@/utils/dayjs'
import { paths } from '@/utils/paths'
import { BaseCard } from './base/card'
import { Avatar } from './ui/avatar'
import { Subtitle, Title } from './ui/text'

type TPatientCardProps = {
	data: TPatient
	selected?: boolean
	className?: string
	subtitle?: string
	/** Dim card when patient is private (e.g. patients list). */
	dimPrivate?: boolean
	onPress?: (e: GestureResponderEvent) => void
}

export const PatientCard = ({
	data,
	selected,
	className,
	subtitle,
	dimPrivate,
	onPress,
}: TPatientCardProps) => {
	const ageYears = data.dob
		? $d(data.dod ?? undefined).diff(data.dob, 'years')
		: null

	return (
		<BaseCard
			onPress={onPress}
			className={cn('p-5', className, {
				'border-2 border-green-500 dark:border-green-300': selected,
				'opacity-70': dimPrivate && data.public === false,
			})}
		>
			<View className="items-center gap-4 flex-row">
				<Avatar
					variant="secondary"
					className="w-16 h-16"
					text={data.name}
					image={paths.document(data.avatar?.uri)}
				/>
				<View className="flex-1">
					<Title>{data.name}</Title>
					{data.dob ? (
						<Subtitle>
							{$df(data.dob, 'DD MMMM, YYYY')}
							{ageYears != null ? ` (${ageYears} yrs)` : ''}
						</Subtitle>
					) : null}
					{data.dod ? (
						<Subtitle>Died {$df(data.dod, 'DD MMMM, YYYY')}</Subtitle>
					) : null}
					{subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
				</View>
			</View>
		</BaseCard>
	)
}
