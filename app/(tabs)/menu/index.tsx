import { ColorSchemePicker } from '@/components/ColorSchemePicker'
import { IconCard } from '@/components/IconCard'
import { Grid, GridItem } from '@/components/ui/grid'
import { router } from 'expo-router'
import {
	CloudUploadIcon,
	FolderSyncIcon,
	HistoryIcon,
	PaletteIcon,
} from 'lucide-react-native'
import { ScrollView } from 'react-native'

export default function Screen() {
	return (
		<ScrollView
			contentContainerClassName="justify-end px-4 py-4"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Grid className="gap-4" _extra={{ className: 'grid-cols-3' }}>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<IconCard
						icon={HistoryIcon}
						title="Temp"
						iconClassName="text-blue-500"
						onTouchStart={() => router.push('/temp')}
					/>
				</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<IconCard
						icon={CloudUploadIcon}
						title="Backup"
						iconClassName="text-blue-500"
						onTouchStart={() => router.push('/backup')}
					/>
				</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<IconCard
						icon={FolderSyncIcon}
						title="Files"
						iconClassName="text-orange-500"
						onTouchStart={() => router.push('/files')}
					/>
				</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<ColorSchemePicker
						trigger={v => (
							<IconCard
								icon={PaletteIcon}
								title="Theme"
								iconClassName="text-green-500"
								onTouchStart={v.onPress}
							/>
						)}
					/>
				</GridItem>
			</Grid>
		</ScrollView>
	)
}
