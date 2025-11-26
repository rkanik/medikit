import { FileManager } from '@/components/base/FileManager'
import { ListGroup } from '@/components/base/ListGroup'
import { BaseListItem } from '@/components/base/ListItem'
import { Button, ButtonText } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { router } from 'expo-router'
import { CloudUploadIcon } from 'lucide-react-native'
import { View } from 'react-native'

export default function Screen() {
	const { colorScheme, setColorScheme } = useColorSchemeStorage()
	return (
		<View className="flex-1 px-4">
			<ListGroup title="General">
				<BaseListItem
					showRightIcon
					text="Backup to Cloud"
					label="Backup"
					icon={CloudUploadIcon}
					onPress={() => router.push('/backup')}
				/>
				<Divider className="dark:bg-neutral-700" />
				<BaseListItem showRightIcon text="Restore from Cloud" label="Restore" />
			</ListGroup>

			<View className="mt-4 dark:bg-neutral-900 rounded-lg p-4 flex-1">
				<Button
					onPress={() => {
						setColorScheme(colorScheme === 'light' ? 'dark' : 'light')
					}}
				>
					<ButtonText className="capitalize">{colorScheme} mode</ButtonText>
				</Button>
				<FileManager />
			</View>
		</View>
	)
}
