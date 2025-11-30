import { api } from '@/api'
import { PatientPicker } from './PatientPicket'
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar'

export const CurrentPatientPicker = () => {
	const { data, setData } = api.patients.useCurrentPatient()
	return (
		<PatientPicker
			value={data}
			height={400}
			onChange={patient => setData(patient?.id)}
			trigger={({ onPress }) => (
				<Avatar size="md" onTouchStart={onPress}>
					<AvatarFallbackText>{data?.name}</AvatarFallbackText>
					<AvatarImage source={{ uri: data?.avatar?.uri }} />
				</Avatar>
			)}
		/>
	)
}
