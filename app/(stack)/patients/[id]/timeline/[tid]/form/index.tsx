import { useCallback, useEffect, useMemo } from 'react'
import { Alert, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseInput } from '@/components/base/input'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'
import { TIMELINE_METRICS } from '@/const/timelineMetrics'
import { usePatientTimelineDeleteMutation } from '@/mutations/usePatientTimelineDeleteMutation'
import {
	usePatientTimelineMutation,
	type TZPatientTimelineEntry,
} from '@/mutations/usePatientTimelineMutation'
import { usePatientTimelineByIdQuery } from '@/queries/usePatientTimelineByIdQuery'
import { useInvalidatePatientTimelineQuery } from '@/queries/usePatientTimelineQuery'

type TFormValues = {
	id?: number | null
	patientId: number
	date: string
	note?: string | null
	metrics: Record<string, string>
}

export default function Screen() {
	const { id, tid } = useLocalSearchParams()
	const patientId = Number(id)
	const { data } = usePatientTimelineByIdQuery(Number(tid))
	const { mutateAsync: submitEntry } = usePatientTimelineMutation()
	const { mutateAsync: deleteEntry } = usePatientTimelineDeleteMutation()
	const invalidateTimeline = useInvalidatePatientTimelineQuery()

	const defaultMetrics = useMemo(() => {
		return Object.fromEntries(TIMELINE_METRICS.map(metric => [metric.key, '']))
	}, [])

	const form = useForm<TFormValues>({
		defaultValues: {
			patientId,
			date: new Date().toISOString(),
			note: '',
			metrics: defaultMetrics,
		},
	})

	const onSubmit = useCallback(
		async (values: TFormValues) => {
			if (!values.date?.trim()) {
				form.setError('root', { message: 'Date is required!' })
				return
			}
			const height = String(values.metrics?.height ?? '').trim()
			const weight = String(values.metrics?.weight ?? '').trim()
			const hasHeight = height !== '' && !Number.isNaN(Number(height))
			const hasWeight = weight !== '' && !Number.isNaN(Number(weight))
			if (!hasHeight && !hasWeight) {
				form.setError('root', {
					message: 'Enter at least height or weight.',
				})
				return
			}
			try {
				const payload: TZPatientTimelineEntry = {
					id: values.id,
					patientId: values.patientId,
					date: values.date,
					note: values.note,
					values: TIMELINE_METRICS.map(metric => {
						const raw = String(values.metrics?.[metric.key] ?? '').trim()
						if (!raw || raw === 'null' || raw === 'undefined') {
							return null
						}
						const num = Number(raw)
						if (Number.isNaN(num)) return null
						return {
							key: metric.key,
							value: String(num),
							unit: metric.unit,
						}
					}).filter((item): item is NonNullable<typeof item> => item != null),
				}
				await submitEntry(payload)
				invalidateTimeline()
				router.back()
			} catch (error: any) {
				form.setError('root', {
					message: error.message,
				})
			}
		},
		[form, invalidateTimeline, submitEntry],
	)

	const onRemove = useCallback(() => {
		Alert.alert('Remove', 'Are you sure you want to remove this entry?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Remove',
				onPress: async () => {
					if (!data?.id) return
					await deleteEntry(data.id)
					invalidateTimeline()
					router.back()
				},
			},
		])
	}, [data?.id, deleteEntry, invalidateTimeline])

	useEffect(() => {
		if (data) {
			const metrics = { ...defaultMetrics }
			for (const item of data.values ?? []) {
				metrics[item.key] = item.value
			}
			form.reset({
				id: data.id,
				patientId: data.patientId ?? patientId,
				date: data.date,
				note: data.note,
				metrics,
			})
		}
	}, [data, defaultMetrics, form, patientId])

	if (tid !== 'new' && !data) {
		return (
			<View className="flex-1 px-4">
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<Text>Growth entry not found!</Text>
			</View>
		)
	}

	return (
		<KeyboardAvoidingScrollView>
			<Stack.Screen
				options={{
					title: data ? 'Update Growth' : 'New Growth',
				}}
			/>
			<FormProvider {...form}>
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					className="px-4 pt-4 pb-32 flex justify-end flex-1 gap-4"
				>
					<Grid cols={2} gap={16}>
						<GridItem colSpan={2}>
							<BaseDatePicker
								required
								name="date"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								label="Date"
								control={form.control}
							/>
						</GridItem>
						{TIMELINE_METRICS.map(metric => (
							<GridItem key={metric.key}>
								<BaseInput
									name={`metrics.${metric.key}`}
									label={`${metric.label} (${metric.unit})`}
									keyboardType="decimal-pad"
									control={form.control}
								/>
							</GridItem>
						))}
						<GridItem colSpan={2}>
							<BaseInput name="note" label="Note" control={form.control} />
						</GridItem>
					</Grid>
					{form.formState.errors.root?.message ? (
						<Text className="text-red-500">
							{form.formState.errors.root.message}
						</Text>
					) : null}
					<BaseActions
						className="relative justify-end px-0"
						data={[
							{
								pill: true,
								prependIcon: 'x',
								onPress: () => router.back(),
							},
							{
								pill: true,
								variant: 'destructive',
								prependIcon: 'trash',
								hidden: !data?.id,
								onPress: onRemove,
							},
							{
								pill: true,
								prependIcon: 'check-circle',
								title: 'Submit',
								onPress(e) {
									form.handleSubmit(onSubmit)(e)
								},
							},
						]}
					/>
				</Form>
			</FormProvider>
		</KeyboardAvoidingScrollView>
	)
}
