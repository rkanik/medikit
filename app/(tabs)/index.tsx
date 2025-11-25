import { Button, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { fs } from '@/utils/fs'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

export default function HomeScreen() {
	// return <Redirect href="/patients/new/form" />

	useEffect(() => {
		const list = fs.list()
		console.log(JSON.stringify(list, null, 2))
	}, [])

	return (
		<View className="flex-1 px-4">
			<Text className="text-2xl font-bold">Home</Text>

			<Button onPress={() => router.push('/patients/new/form')}>
				<ButtonText>Add Patient</ButtonText>
			</Button>
		</View>
	)
}
