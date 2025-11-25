import { api } from '@/api'
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button, ButtonIcon } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { $d, $df } from '@/utils/dayjs'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { EditIcon } from 'lucide-react-native'
import { Fragment } from 'react'
import { View } from 'react-native'

export default function Screen() {
	const { id } = useLocalSearchParams()

	const { data } = api.patients.usePatientById(Number(id))

	if (!data) {
		return (
			<Fragment>
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<Box className="flex-1 px-5">
					<Text>Patient not found!</Text>
				</Box>
			</Fragment>
		)
	}

	return (
		<Fragment>
			<Stack.Screen
				options={{
					title: 'Profile',
					headerRight: () => (
						<Button
							size="lg"
							variant="link"
							onPress={() => router.push(`/patients/${id}/form`)}
						>
							<ButtonIcon as={EditIcon} size="lg" />
						</Button>
					),
				}}
			/>
			<Box className="flex-1 px-5 py-5 items-center">
				<Avatar size="2xl">
					<AvatarFallbackText>{data.name}</AvatarFallbackText>
					<AvatarImage source={{ uri: data.avatar?.uri }} />
				</Avatar>
				<Heading size="xl" className="mt-5">
					{data.name}
				</Heading>
				{data.dob && (
					<View className="mt-2">
						<Text>
							{$df(data.dob, 'DD MMMM, YYYY')} ({$d().diff(data.dob, 'years')}
							yrs)
						</Text>
					</View>
				)}
			</Box>
		</Fragment>
	)
}
