import { Box } from '@/components/ui/box'
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab'
import { router } from 'expo-router'
import { PlusIcon } from 'lucide-react-native'

export default function PatientsScreen() {
	return (
		<Box className="px-4 flex-1">
			<Fab
				placement="bottom right"
				onPress={() => router.push('/patients/new/form')}
			>
				<FabIcon as={PlusIcon} />
				<FabLabel>Add Patient</FabLabel>
			</Fab>
		</Box>
	)
}
