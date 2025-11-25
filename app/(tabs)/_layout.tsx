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

import { useScheme } from '@/hooks/useScheme'
import { StatusBar } from 'react-native'
import { neutral } from 'tailwindcss/colors'

export default function TabLayout() {
	const { scheme } = useScheme()
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				sceneStyle: {
					paddingTop: StatusBar.currentHeight,
					backgroundColor: 'transparent',
				},
				tabBarStyle: {
					height: 96,
					paddingTop: 16,
					borderColor: scheme({
						dark: neutral[600],
						light: neutral[200],
					}),
					backgroundColor: scheme({
						dark: neutral[800],
						light: neutral[50],
					}),
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => (
						<Icon as={HomeIcon} size="xl" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="patients/index"
				options={{
					title: 'Patients',
					tabBarIcon: ({ color }) => (
						<Icon as={UsersIcon} size="xl" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="records"
				options={{
					title: 'Records',
					tabBarIcon: ({ color }) => (
						<Icon as={ListTodoIcon} size="xl" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="backup"
				options={{
					title: 'Backup',
					tabBarIcon: ({ color }) => (
						<Icon as={CloudUploadIcon} size="xl" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="menu"
				options={{
					title: 'Menu',
					tabBarIcon: ({ color }) => (
						<Icon as={MenuIcon} size="xl" color={color} />
					),
				}}
			/>
		</Tabs>
	)
}
