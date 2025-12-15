import { useCurrentPatient } from '@/api/patients'
import { PatientPicker } from './PatientPicket'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'

export const CurrentPatientPicker = () => {
	const { data, setData } = useCurrentPatient()
	return (
		<PatientPicker
			value={data}
			height={400}
			onChange={patient => setData(patient?.id)}
			trigger={v => {
				if (!data) {
					return <Button {...v} text="All" icon="user" />
				}
				return (
					<Avatar
						{...v}
						text={data?.name}
						image={data?.avatar?.uri}
						className="border-2 border-green-500 dark:border-green-300 p-px"
					/>
				)
			}}
		/>
	)
}
