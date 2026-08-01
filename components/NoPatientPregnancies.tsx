import { router } from 'expo-router'
import { BaseButton } from './base/button'
import { BaseCard } from './base/card'
import { Subtitle, Title } from './ui/text'

type TNoPatientPregnanciesProps = {
	patientId: number
}

export const NoPatientPregnancies = ({
	patientId,
}: TNoPatientPregnanciesProps) => {
	return (
		<BaseCard className="items-center py-8">
			<Title>No pregnancies yet!</Title>
			<Subtitle>Track pregnancy journeys and linked children</Subtitle>
			<BaseButton
				prependIcon="plus"
				title="Pregnancy"
				className="mt-4"
				onPress={() =>
					router.push(`/patients/${patientId}/pregnancies/new/form`)
				}
			/>
		</BaseCard>
	)
}
