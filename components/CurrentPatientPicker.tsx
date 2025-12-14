import { api } from '@/api'
import { PatientPicker } from './PatientPicket'
import { Avatar } from './ui/avatar'

export const CurrentPatientPicker = () => {
	const { data, setData } = api.patients.useCurrentPatient()
	return (
		<PatientPicker
			value={data}
			height={400}
			onChange={patient => setData(patient?.id)}
			trigger={v => (
				<Avatar {...v} text={data?.name} image={data?.avatar?.uri} />
			)}
		/>
	)
}
