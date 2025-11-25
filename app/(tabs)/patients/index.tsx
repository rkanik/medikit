import { api } from '@/api'
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { $d, $df } from '@/utils/dayjs'
import { router } from 'expo-router'
import { PlusIcon } from 'lucide-react-native'
import { FlatList, Pressable, View } from 'react-native'

export default function PatientsScreen() {
	const { data } = api.patients.usePatients()
	return (
		<Box className="px-5 flex-1">
			<Fab
				placement="bottom right"
				onPress={() => router.push('/patients/new/form')}
			>
				<FabIcon as={PlusIcon} />
				<FabLabel>Add Patient</FabLabel>
			</Fab>
			<FlatList
				data={data}
				renderItem={({ item }) => (
					<Pressable onPress={() => router.push(`/patients/${item.id}`)}>
						<Card size="lg" variant="elevated" className="mt-2">
							<HStack space="lg" className="items-center">
								<Avatar>
									<AvatarFallbackText>{item.name}</AvatarFallbackText>
									<AvatarImage source={{ uri: item.avatar?.uri }} />
								</Avatar>
								<View>
									<Heading size="md">{item.name}</Heading>
									{item.dob && (
										<Text>
											{$df(item.dob, 'DD MMMM, YYYY')}(
											{$d().diff(item.dob, 'years')} yrs)
										</Text>
									)}
								</View>
							</HStack>
						</Card>
					</Pressable>
				)}
			/>
		</Box>
	)
}
