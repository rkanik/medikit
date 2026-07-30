import { View } from 'react-native'
import { HeaderBackButton } from '@react-navigation/elements'
import { router, Stack, Tabs, usePathname, type Href } from 'expo-router'
import { cn } from 'tailwind-variants'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useColors } from '@/hooks/useColors'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'
import { usePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'

const tabItems = [
	{
		title: 'Info',
		name: 'index',
		path: '' as const,
		icon: 'user' as const,
	},
	{
		title: 'Medicines',
		name: 'medicines/index',
		path: 'medicines' as const,
		icon: 'thermometer' as const,
	},
	{
		title: 'Growth',
		name: 'growth/index',
		path: 'growth' as const,
		icon: 'trending-up' as const,
	},
	{
		title: 'Pregnancy',
		name: 'pregnancies/index',
		path: 'pregnancies' as const,
		icon: 'heart' as const,
	},
] as const

export default function PatientTabsLayout() {
	const pathname = usePathname()
	const { id, patientId, isValid } = usePatientIdParam()
	const { background, foreground } = useColors()
	const { data: patient } = usePatientByIdQuery(patientId)
	const { data: pregnanciesData } = usePatientPregnanciesQuery({
		patientId,
		perPage: 1,
	})

	const pregnancyCount = pregnanciesData?.pages?.[0]?.total ?? 0
	const showPregnancyTab =
		patient?.gender === 'Female' || pregnancyCount > 0

	const headerTitle = patient?.name ?? 'Patient'
	const basePath = isValid ? `/patients/${id}` : undefined

	const onHeaderBack = () => {
		if (!basePath) {
			router.back()
			return
		}
		if (pathname.includes('/growth/')) {
			router.replace(`${basePath}/growth` as any)
			return
		}
		if (pathname.includes('/medicines/')) {
			router.replace(`${basePath}/medicines` as any)
			return
		}
		if (pathname.includes('/pregnancies/')) {
			router.replace(`${basePath}/pregnancies` as any)
			return
		}
		if (pathname.endsWith('/form')) {
			router.replace(basePath as any)
			return
		}
		router.back()
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<Tabs
				screenOptions={{
					headerShadowVisible: false,
					sceneStyle: {
						backgroundColor: background,
					},
					headerStyle: {
						backgroundColor: background,
					},
					headerTintColor: foreground,
					headerTitle,
					headerLeft: props => (
						<HeaderBackButton
							{...props}
							tintColor={foreground}
							onPress={onHeaderBack}
						/>
					),
					tabBarStyle: {
						height: 96,
						paddingTop: 8,
						borderColor: background,
						backgroundColor: background,
					},
				}}
			>
				{tabItems.map(item => {
					const href =
						item.name === 'pregnancies/index' && !showPregnancyTab
							? null
							: basePath
								? item.path
									? `${basePath}/${item.path}`
									: basePath
								: undefined

					return (
						<Tabs.Screen
							key={item.name}
							name={item.name}
							options={{
								title: item.title,
								href: href as Href | null | undefined,
								tabBarIcon: v => (
									<View
										className={cn(
											'w-12 h-8 flex items-center justify-center rounded-full',
											{ 'bg-primary': v.focused },
										)}
									>
										<Icon name={item.icon} className="text-xl" />
									</View>
								),
								tabBarLabel: v => (
									<Text
										className={cn('text-base mt-1', {
											'font-semibold text-primary': v.focused,
										})}
									>
										{v.children}
									</Text>
								),
							}}
						/>
					)
				})}
				<Tabs.Screen
					name="form/index"
					options={{
						href: null,
						title: 'Update Patient',
						tabBarStyle: { display: 'none' },
					}}
				/>
				<Tabs.Screen
					name="medicines/[mid]/form/index"
					options={{
						href: null,
						title: 'Medicine',
						tabBarStyle: { display: 'none' },
					}}
				/>
				<Tabs.Screen
					name="growth/[gid]/form/index"
					options={{
						href: null,
						title: 'Growth',
						tabBarStyle: { display: 'none' },
					}}
				/>
				<Tabs.Screen
					name="pregnancies/[pid]/form/index"
					options={{
						href: null,
						title: 'Pregnancy',
						tabBarStyle: { display: 'none' },
					}}
				/>
			</Tabs>
		</>
	)
}
