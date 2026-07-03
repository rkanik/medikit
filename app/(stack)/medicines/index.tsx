import { ScrollView } from 'react-native'

import { BaseJson } from '@/components/base/Json'
import { Text } from '@/components/ui/text'
import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

export default function Screen() {
	const { data } = useQuery({
		queryKey: ['medicines'],
		queryFn: () => {
			return db.query.medicines.findMany({
				with: {
					thumbnail: true,
					patientMedicines: {
						limit: 1,
						columns: {
							id: true,
						},
					},
				},
			})
		},
	})
	return (
		<ScrollView>
			<Text>Medicines</Text>
			<BaseJson data={data} />
		</ScrollView>
	)
}
