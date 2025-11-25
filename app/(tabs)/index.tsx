import { FileManager } from '@/components/base/FileManager'
import { Button, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { fs } from '@/utils/fs'
import { router } from 'expo-router'
import { View } from 'react-native'

export default function HomeScreen() {
	// return <Redirect href="/patients/new/form" />

	return (
		<View className="flex-1 px-4">
			<Text className="text-2xl font-bold">Home</Text>

			<VStack space="md">
				<Button onPress={() => router.push('/patients/new/form')}>
					<ButtonText>Add Patient</ButtonText>
				</Button>

				<Button onPress={() => fs.createDirectory('test/nested/data')}>
					<ButtonText>Create a nested directory</ButtonText>
				</Button>
			</VStack>

			<FileManager />
		</View>
	)
}
