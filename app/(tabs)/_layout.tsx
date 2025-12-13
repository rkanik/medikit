import { CurrentPatientPicker } from '@/components/CurrentPatientPicker'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { appName } from '@/const'
import { colors } from '@/const/colors'
import { useScheme } from '@/hooks/useScheme'
import { useUpdater } from '@/hooks/useUpdater'
import { Image } from 'expo-image'
import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'

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
		icon: 'menu',
	},
]

export default function TabLayout() {
	const { scheme } = useScheme()
	useUpdater()
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
				tabBarActiveTintColor: scheme({
					dark: colors.green[500],
					light: colors.green[500],
				}),
				tabBarStyle: {
					height: 96,
					paddingTop: 8,
					borderColor: scheme({
						dark: colors.neutral[600],
						light: colors.green[200],
					}),
					backgroundColor: scheme({
						dark: colors.neutral[800],
						light: colors.green[50],
					}),
				},
				headerTitle: () => (
					<View className="flex-row items-center gap-2">
						<View className="w-12 h-12 bg-white dark:bg-neutral-800 p-3 rounded-full items-center justify-center border border-green-200 dark:border-neutral-700">
							<Image
								source={require('@/assets/images/icon2.png')}
								style={{ width: '100%', aspectRatio: 1 }}
							/>
						</View>
						<Text size="2xl" className="text-green-600 font-semibold">
							{appName}
						</Text>
					</View>
				),
				headerRight: () => (
					<View className="mr-5">
						<CurrentPatientPicker />
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
								className={cn('px-4 py-2 rounded-full', {
									'dark:bg-neutral-900': v.focused,
								})}
							>
								<Icon size="xl" name={item.icon} color={v.color} />
							</View>
						),
						tabBarLabel: v => (
							<Text
								style={{
									color: v.color,
									fontSize: 12,
									marginTop: 4,
									fontWeight: v.focused ? 'bold' : 'normal',
								}}
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
