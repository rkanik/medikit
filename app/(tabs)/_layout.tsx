import { View } from 'react-native'
import { Image } from 'expo-image'
import { Link, Tabs, usePathname } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseButton } from '@/components/base/button'
import { CurrentPatientPicker } from '@/components/CurrentPatientPicker'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { appName } from '@/const'
import { useApp } from '@/context/AppContext'
import { useColors } from '@/hooks/useColors'
import { useUpdater } from '@/hooks/useUpdater'

const items = [
	{
		title: 'Home',
		name: 'index',
		icon: 'home' as const,
	},
	{
		title: 'Patients',
		name: 'patients/index',
		icon: 'users' as const,
	},
	{
		title: 'Menu',
		name: 'menu/index',
		icon: 'grid' as const,
	},
]

export default function TabLayout() {
	useUpdater()

	const pathname = usePathname()
	const { foreground, primary, background } = useColors()
	const { isSearching, setSearching } = useApp()

	return (
		<Tabs
			screenOptions={{
				headerShadowVisible: false,
				sceneStyle: {
					backgroundColor: background,
				},
				headerStyle: {
					backgroundColor: background,
				},
				tabBarActiveTintColor: primary,
				tabBarInactiveTintColor: foreground,
				tabBarStyle: {
					height: 96,
					paddingTop: 8,
					borderColor: background,
					backgroundColor: background,
				},
				headerTitle: () => {
					return (
						<Link href="/">
							<View className="flex-row items-center gap-2">
								<View className="w-12 h-12 bg-white p-3 rounded-full items-center justify-center">
									<Image
										source={require('@/assets/images/icon2.png')}
										style={{ width: '100%', aspectRatio: 1 }}
									/>
								</View>
								<Text className="text-green-600 font-semibold text-xl">
									{appName}
								</Text>
							</View>
						</Link>
					)
				},
				headerRight: () => {
					return (
						<View className="pr-5">
							{pathname === '/' && (
								<View className="flex-row items-center gap-2">
									<BaseButton
										pill
										size="icon"
										prependIcon={isSearching ? 'x' : 'search'}
										prependIconClassName="text-lg"
										onPress={() => setSearching(v => !v)}
									/>
									<CurrentPatientPicker />
								</View>
							)}
						</View>
					)
				},
			}}
		>
			{items.map(item => (
				<Tabs.Screen
					key={item.name}
					name={item.name}
					options={{
						title: item.title,
						tabBarIcon: v => (
							<View
								className={cn(
									'w-12 h-8 flex items-center justify-center rounded-full',
									{
										'bg-green-300 dark:bg-green-500': v.focused,
									},
								)}
							>
								<Icon name={item.icon} className="text-xl" />
							</View>
						),
						tabBarLabel: v => (
							<Text
								className={cn('text-base mt-1', {
									'font-semibold text-green-500 dark:text-green-300': v.focused,
								})}
							>
								{v.children}
							</Text>
						),
					}}
				/>
			))}
		</Tabs>
	)
}
