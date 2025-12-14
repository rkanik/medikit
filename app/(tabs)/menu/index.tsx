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
			<Grid cols={3} gap={16}>
				<GridItem></GridItem>
				<GridItem>
					<IconCard
						icon="download"
						title="Updates"
						titleClassName="text-lg"
						iconClassName="text-3xl text-teal-500 dark:text-teal-400"
						onPress={() => router.push('/updates')}
					/>
				</GridItem>
				<GridItem>
					<IconCard
						icon="clock"
						title="Temp"
						titleClassName="text-lg"
						iconClassName="text-3xl text-red-500 dark:text-red-400"
						onPress={() => router.push('/temp')}
					/>
				</GridItem>
				<GridItem>
					<IconCard
						icon="upload-cloud"
						title="Backup"
						titleClassName="text-lg"
						iconClassName="text-3xl text-blue-500 dark:text-blue-400"
						onPress={() => router.push('/backup')}
					/>
				</GridItem>
				<GridItem>
					<IconCard
						icon="folder"
						title="Files"
						titleClassName="text-lg"
						iconClassName="text-3xl text-orange-500 dark:text-orange-400"
						onPress={() => router.push('/files')}
					/>
				</GridItem>
				<GridItem>
					<ColorSchemePicker
						trigger={v => (
							<IconCard
								icon="sun"
								title="Theme"
								titleClassName="text-lg"
								iconClassName="text-3xl text-green-500 dark:text-green-400"
								onPress={v.onPress}
							/>
						)}
					/>
				</GridItem>
			</Grid>
		</ScrollView>
	)
}
