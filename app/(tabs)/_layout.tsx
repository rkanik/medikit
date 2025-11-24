import { Tabs } from 'expo-router'
import React from 'react'

import { Icon } from '@/components/ui/icon'
import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import {
	CloudUploadIcon,
	HomeIcon,
	ListTodoIcon,
	MenuIcon,
} from 'lucide-react-native'

export default function TabLayout() {
	const { colorScheme } = useColorSchemeStorage()
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					height: 96,
					paddingTop: 16,
					backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
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
				name="menu"
				options={{
					title: 'Menu',
					tabBarIcon: ({ color }) => (
						<Icon as={MenuIcon} size="xl" color={color} />
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
		</Tabs>
	)
}
