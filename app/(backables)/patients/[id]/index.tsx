import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseListItem } from '@/components/base/ListItem'
import { Avatar } from '@/components/ui/avatar'
import { Divider } from '@/components/ui/divider'
import { Text } from '@/components/ui/text'
import { $d, $df } from '@/utils/dayjs'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback } from 'react'
import { Alert, ScrollView, View } from 'react-native'

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data, remove } = api.patients.usePatientById(Number(id))

	const onDelete = useCallback(() => {
		Alert.alert('Delete', 'Are you sure you want to delete this item?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				onPress: () => {
					remove()
					router.back()
				},
			},
		])
	}, [remove])

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
		<View className="flex-1">
			<Stack.Screen options={{ title: 'Patient Details' }} />
			<ScrollView
				contentContainerClassName="px-4 pb-32 justify-end"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View className="items-center">
					<Avatar
						className="h-24 w-24"
						textClassName="text-2xl"
						text={data.name}
						image={data.avatar?.uri}
					/>
					<Text size="xl" className="mt-5">
						{data.name}
					</Text>
					{data.dob && (
						<Text>
							{$df(data.dob, 'DD MMMM, YYYY')} ({$d().diff(data.dob, 'years')}
							yrs)
						</Text>
					)}
				</View>
				<View className="mt-8">
					<Text className="uppercase text-sm tracking-wide ml-2">
						Basic Information
					</Text>
					<View className="dark:bg-neutral-900 rounded-lg mt-2">
						<BaseListItem text={data.name} icon="user" label="Name" />
						{data.dob && (
							<Fragment>
								<Divider className="dark:bg-neutral-700" />
								<BaseListItem
									text={$df(data.dob, 'DD MMMM, YYYY')}
									icon="calendar"
									label="Date of Birth"
								/>
							</Fragment>
						)}
					</View>
				</View>
			</ScrollView>
			<BaseActions
				className="bottom-12"
				data={[
					{
						icon: 'trash',
						onPress: onDelete,
					},
					{
						icon: 'edit',
						text: 'Update',
						onPress: () => router.push(`/patients/${id}/form`),
					},
				]}
			/>
		</View>
	)
}
