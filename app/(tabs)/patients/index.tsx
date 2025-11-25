import { api } from '@/api'
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { $d, $df } from '@/utils/dayjs'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { PlusIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

export default function PatientsScreen() {
	const { data } = api.patients.usePatients()
	return (
		<View className="flex-1">
			<FlashList
				data={data}
				contentContainerStyle={{
					flexGrow: 1,
					flexDirection: 'column-reverse',
					paddingHorizontal: 20,
				}}
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
			<View className="flex-row justify-center p-5">
				<Button
					size="xl"
					variant="solid"
					className="rounded-full"
					onPress={() => router.push('/patients/new/form')}
				>
					<ButtonIcon as={PlusIcon} size="lg" />
					<ButtonText size="md">Add Patient</ButtonText>
				</Button>
			</View>
		</View>
	)
}
