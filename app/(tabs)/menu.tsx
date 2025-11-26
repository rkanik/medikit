import { FileManager } from '@/components/base/FileManager'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'

export default function Screen() {
	const { colorScheme, setColorScheme } = useColorSchemeStorage()
	return (
		<Box className="p-16 flex-1">
			<Button
				onPress={() => {
					setColorScheme(colorScheme === 'light' ? 'dark' : 'light')
				}}
			>
				<ButtonText className="capitalize">{colorScheme} mode</ButtonText>
			</Button>
			<FileManager />
		</Box>
	)
}
