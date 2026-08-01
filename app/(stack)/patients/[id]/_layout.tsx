import { Pressable, View } from 'react-native'
import { Link, Slot, Stack, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from 'tailwind-variants'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useColors } from '@/hooks/useColors'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'
import { usePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'

const tabItems = [
	{
		title: 'Basic',
		path: '' as const,
		icon: 'user' as const,
		match: (pathname: string, basePath: string) =>
			pathname === basePath || pathname === `${basePath}/`,
	},
	{
		title: 'Medicines',
		path: 'medicines' as const,
		icon: 'thermometer' as const,
		match: (pathname: string, basePath: string) =>
			pathname.startsWith(`${basePath}/medicines`) &&
			!pathname.includes('/form'),
	},
	{
		title: 'Growth',
		path: 'growth' as const,
		icon: 'trending-up' as const,
		match: (pathname: string, basePath: string) =>
			pathname.startsWith(`${basePath}/growth`) && !pathname.includes('/form'),
	},
	{
		title: 'Pregnancy',
		path: 'pregnancies' as const,
		icon: 'heart' as const,
		match: (pathname: string, basePath: string) =>
			pathname.startsWith(`${basePath}/pregnancies`) &&
			!pathname.includes('/form'),
	},
] as const

export default function PatientLayout() {
	const pathname = usePathname()
	const insets = useSafeAreaInsets()
	const { id, patientId, isValid } = usePatientIdParam()
	const { background } = useColors()
	const { data: patient } = usePatientByIdQuery(patientId)
	const { data: pregnanciesData } = usePatientPregnanciesQuery({
		patientId,
		perPage: 1,
	})

	const pregnancyCount = pregnanciesData?.pages?.[0]?.total ?? 0
	const showPregnancyTab = patient?.gender === 'Female' || pregnancyCount > 0

	const basePath = isValid ? `/patients/${id}` : ''
	const isFormScreen = pathname.includes('/form')
	const visibleTabs = tabItems.filter(
		item => item.path !== 'pregnancies' || showPregnancyTab,
	)
	return (
		<>
			<Stack.Screen
				options={{
					title: patient?.name ?? 'Patient Profile',
				}}
			/>
			<View className="flex-1">
				<Slot />
				{!isFormScreen && basePath ? (
					<View
						className="flex-row items-start justify-around border-t border-transparent pt-2"
						style={{
							height: 96,
							paddingBottom: Math.max(insets.bottom, 8),
							backgroundColor: background,
						}}
					>
						{visibleTabs.map(item => {
							const href = item.path ? `${basePath}/${item.path}` : basePath
							const focused = item.match(pathname, basePath)
							return (
								<Link key={item.title} href={href as any} replace asChild>
									<Pressable className="flex-1 items-center">
										<View
											className={cn(
												'w-12 h-8 flex items-center justify-center rounded-3xl',
												{ 'bg-primary': focused },
											)}
										>
											<Icon name={item.icon} className="text-xl" />
										</View>
										<Text
											className={cn('text-base mt-1', {
												'font-semibold text-primary': focused,
											})}
										>
											{item.title}
										</Text>
									</Pressable>
								</Link>
							)
						})}
					</View>
				) : null}
			</View>
		</>
	)
}
