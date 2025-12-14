import { ColorSchemePicker } from '@/components/ColorSchemePicker'
import { IconCard } from '@/components/IconCard'
import { Grid, GridItem } from '@/components/ui/grid'
import { router } from 'expo-router'
import { ScrollView } from 'react-native'

export default function Screen() {
	return (
		<ScrollView
			contentContainerClassName="justify-end px-4 py-4"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Grid cols={3} gap={8}>
				{/* <GridItem></GridItem> */}
				<GridItem>
					<IconCard
						icon="download"
						title="Updates"
						iconClassName="text-teal-500"
						onPress={() => router.push('/updates')}
					/>
				</GridItem>
				<GridItem>
					<IconCard
						icon="history"
						title="Temp"
						iconClassName="text-red-500"
						onPress={() => router.push('/temp')}
					/>
				</GridItem>
				<GridItem>
					<IconCard
						icon="cloud-upload"
						title="Backup"
						iconClassName="text-blue-500"
						onPress={() => router.push('/backup')}
					/>
				</GridItem>
				<GridItem>
					<IconCard
						icon="folder-sync"
						title="Files"
						iconClassName="text-orange-500"
						onPress={() => router.push('/files')}
					/>
				</GridItem>
				<GridItem>
					<ColorSchemePicker
						trigger={v => (
							<IconCard
								icon="palette"
								title="Theme"
								iconClassName="text-green-500"
								onPress={v.onPress}
							/>
						)}
					/>
				</GridItem>
			</Grid>
		</ScrollView>
	)
}
