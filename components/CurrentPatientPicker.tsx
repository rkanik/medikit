import { useCurrentPatient } from '@/api/patients'
import { paths } from '@/utils/paths'
import { BaseButton } from './base/button'
import { PatientPicker } from './PatientPicket'
import { Avatar } from './ui/avatar'

export const CurrentPatientPicker = () => {
	const { data, setData } = useCurrentPatient()
	return (
		<PatientPicker
			value={data}
			height={400}
			onChange={patient => setData(patient?.id)}
			trigger={v => {
				if (!data) {
					return (
						<BaseButton
							{...v}
							pill
							title="All"
							variant="secondary"
							prependIcon="user"
						/>
					)
				}
				return (
					<Avatar
						{...v}
						text={data?.name}
						image={paths.document(data?.avatar?.uri)}
						className="border-2 border-green-500 dark:border-green-300 p-px"
					/>
				)
			}}
		/>
	)
}
