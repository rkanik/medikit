import { View } from 'react-native'

import { Image } from 'expo-image'
import { Link, Tabs, usePathname } from 'expo-router'
import { cn } from 'tailwind-variants'

import { CurrentPatientPicker } from '@/components/CurrentPatientPicker'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { appName } from '@/const'
import { colors } from '@/const/colors'
import { useApp } from '@/context/AppContext'
import { useScheme } from '@/hooks/useScheme'
import { useSchemeColors } from '@/hooks/useSchemeColors'
import { useUpdater } from '@/hooks/useUpdater'

const items = [
	{
		title: 'Home',
		name: 'index',
		icon: 'home',
	},
	{
		title: 'Patients',
		name: 'patients/index',
		icon: 'users',
	},
	{
		title: 'Menu',
		name: 'menu/index',
		icon: 'grid',
	},
]

export default function TabLayout() {
	useUpdater()

	const pathname = usePathname()
	const { scheme } = useScheme()
	const { borderColor, textColor } = useSchemeColors()
	const { isSearching, setSearching } = useApp()

	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				headerStyle: {
					backgroundColor: 'transparent',
				},
				sceneStyle: {
					backgroundColor: 'transparent',
				},
				tabBarActiveTintColor: colors.green[500],
				tabBarInactiveTintColor: textColor,
				tabBarStyle: {
					height: 96,
					paddingTop: 8,
					borderColor,
					backgroundColor: scheme({
						dark: colors.neutral[800],
						light: 'white',
					}),
				},
				headerTitle: () => (
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
				),
				headerRight: () => (
					<View className="mr-5">
						{pathname === '/' && (
							<View className="flex-row items-center gap-2">
								<Button
									icon={isSearching ? 'x' : 'search'}
									onPress={() => setSearching(v => !v)}
								/>
								<CurrentPatientPicker />
							</View>
						)}
					</View>
				),
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
