import { Tabs } from 'expo-router'
import React from 'react'

import { Icon } from '@/components/ui/icon'
import {
	CloudUploadIcon,
	HomeIcon,
	ListTodoIcon,
	MenuIcon,
	UsersIcon,
} from 'lucide-react-native'

import { CurrentPatientPicker } from '@/components/CurrentPatientPicker'
import { Text } from '@/components/ui/text'
import { useScheme } from '@/hooks/useScheme'
import { cn } from '@/utils/cn'
import { View } from 'react-native'
import { green, neutral } from 'tailwindcss/colors'

const items = [
	{
		title: 'Home',
		name: 'index',
		icon: HomeIcon,
	},
	{
		title: 'Records',
		name: 'records',
		icon: ListTodoIcon,
	},
	{
		title: 'Patients',
		name: 'patients/index',
		icon: UsersIcon,
	},
	{
		title: 'Backup',
		name: 'backup',
		icon: CloudUploadIcon,
	},
	{
		title: 'Menu',
		name: 'menu',
		icon: MenuIcon,
	},
]

export default function TabLayout() {
	const { scheme } = useScheme()

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
					dark: green[500],
					light: green[500],
				}),
				tabBarStyle: {
					height: 96,
					paddingTop: 8,
					borderColor: scheme({
						dark: neutral[600],
						light: neutral[200],
					}),
					backgroundColor: scheme({
						dark: neutral[800],
						light: neutral[50],
					}),
				},
				headerTitle: () => (
					<Text size="2xl" bold className="text-green-500">
						Medi Kit
					</Text>
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
								<Icon size="xl" as={item.icon} color={v.color} />
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
