import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseListItem } from '@/components/base/ListItem'
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Divider } from '@/components/ui/divider'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { $d, $df } from '@/utils/dayjs'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import {
	CalendarIcon,
	EditIcon,
	Trash2Icon,
	UserIcon,
} from 'lucide-react-native'
import { Fragment, useCallback } from 'react'
import { Alert, View } from 'react-native'

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
		<Fragment>
			<Stack.Screen options={{ title: 'Patient Details' }} />
			<View className="flex-1 justify-end px-4 pt-4 pb-28">
				<View className="items-center">
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
				<View className="mt-8">
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
				<BaseActions
					className="bottom-8"
					data={[
						{
							icon: Trash2Icon,
							onPress: onDelete,
						},
						{
							icon: EditIcon,
							text: 'Update',
							onPress: () => router.push(`/patients/${id}/form`),
						},
					]}
				/>
			</View>
		</Fragment>
	)
}
