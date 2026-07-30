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
			<Title>No growth entries!</Title>
			<Subtitle>Add height and weight to get started</Subtitle>
			<BaseButton
				prependIcon="plus"
				title="Growth"
				className="mt-4"
				onPress={() =>
					router.push(`/patients/${patientId}/timeline/new/form`)
				}
			/>
		</BaseCard>
	)
}
