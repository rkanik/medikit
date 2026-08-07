import { router } from 'expo-router'
import { BaseButton } from './base/button'
import { BaseCard } from './base/card'
import { Subtitle, Title } from './ui/text'

type TNoPatientTimelineProps = {
	patientId: number
}

export const NoPatientTimeline = ({ patientId }: TNoPatientTimelineProps) => {
	return (
		<BaseCard className="items-center py-8">
			<Title>No vitals yet</Title>
			<Subtitle>
				Record height, weight, BP, blood sugar, fever, and more
			</Subtitle>
			<BaseButton
				prependIcon="plus"
				title="Record"
				className="mt-4"
				onPress={() =>
					router.push(`/patients/${patientId}/growth/new/form`)
				}
			/>
		</BaseCard>
	)
}
