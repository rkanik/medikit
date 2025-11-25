import { api } from '@/api'
import { BaseListItem } from '@/components/base/ListItem'
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button, ButtonIcon } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { $d, $df } from '@/utils/dayjs'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { CalendarIcon, EditIcon, UserIcon } from 'lucide-react-native'
import { Fragment } from 'react'
import { Alert, View } from 'react-native'

export default function Screen() {
	const { id } = useLocalSearchParams()

	const { data, remove } = api.patients.usePatientById(Number(id))

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
			<View className="px-5 py-5 items-center">
				<Avatar size="2xl">
					<AvatarFallbackText>{data.name}</AvatarFallbackText>
					<AvatarImage source={{ uri: data.avatar?.uri }} />
				</Avatar>
				<Heading size="xl" className="mt-5">
					{data.name}
				</Heading>
				{data.dob && (
					<Text>
						{$df(data.dob, 'DD MMMM, YYYY')} ({$d().diff(data.dob, 'years')}
						yrs)
					</Text>
				)}
			</View>
			<View className="px-5 py-5">
				<View>
					<Text className="uppercase text-sm tracking-wide ml-2">
						Basic Information
					</Text>
					<View className="dark:bg-neutral-900 rounded-lg mt-2">
						<BaseListItem text={data.name} icon={UserIcon} label="Name" />
						{data.dob && (
							<Fragment>
								<Divider className="dark:bg-neutral-700" />
								<BaseListItem
									text={$df(data.dob, 'DD MMMM, YYYY')}
									icon={CalendarIcon}
									label="Date of Birth"
								/>
							</Fragment>
						)}
					</View>
				</View>

				<View className="mt-5">
					<Text className="uppercase text-sm tracking-wide ml-2">Actions</Text>
					<View className="dark:bg-neutral-900 rounded-lg mt-2">
						<BaseListItem
							text="Update Profile"
							showRightIcon
							onPress={() => router.push(`/patients/${id}/form`)}
						/>
						<Divider className="dark:bg-neutral-700" />
						<BaseListItem
							text="Delete Profile"
							textClassName="dark:text-red-500"
							showRightIcon
							rightIconClassName="dark:text-red-500"
							onPress={() => {
								Alert.alert(
									'Delete Profile',
									'Are you sure you want to delete this profile?',
									[
										{
											text: 'Cancel',
											style: 'cancel',
										},
										{
											text: 'Delete',
											onPress: () => {
												remove()
												router.back()
											},
										},
									],
								)
							}}
						/>
					</View>
				</View>
			</View>
		</Fragment>
	)
}
