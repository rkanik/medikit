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
			<Grid className="gap-4" _extra={{ className: 'grid-cols-3' }}>
				<GridItem _extra={{ className: 'col-span-1' }}>{/*  */}</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<IconCard
						icon="download"
						title="Updates"
						iconClassName="text-teal-500"
						onTouchStart={() => router.push('/updates')}
					/>
				</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<IconCard
						icon="history"
						title="Temp"
						iconClassName="text-red-500"
						onTouchStart={() => router.push('/temp')}
					/>
				</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<IconCard
						icon="cloud-upload"
						title="Backup"
						iconClassName="text-blue-500"
						onTouchStart={() => router.push('/backup')}
					/>
				</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<IconCard
						icon="folder-sync"
						title="Files"
						iconClassName="text-orange-500"
						onTouchStart={() => router.push('/files')}
					/>
				</GridItem>
				<GridItem _extra={{ className: 'col-span-1' }}>
					<ColorSchemePicker
						trigger={v => (
							<IconCard
								icon="palette"
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
