import { useCallback, useEffect, useMemo } from 'react'
import { Alert, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
	getTimelineMetric,
	isTimelineMetricKey,
	parseTimelineMetricFormValue,
	TIMELINE_BOOLEAN_OPTIONS,
	TIMELINE_METRICS,
} from '@/const/timelineMetrics'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
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
	const { gid, metric: metricParam } = useLocalSearchParams<{
		gid: string
		metric?: string
	}>()
	const { patientId, isValid: hasPatientId } = usePatientIdParam()
	const { data, isPending } = usePatientTimelineByIdQuery(Number(gid))
	const { mutateAsync: submitEntry } = usePatientTimelineMutation()
	const { mutateAsync: deleteEntry } = usePatientTimelineDeleteMutation()
	const invalidateTimeline = useInvalidatePatientTimelineQuery()

	const activeMetric = useMemo(() => {
		const key = Array.isArray(metricParam) ? metricParam[0] : metricParam
		if (!isTimelineMetricKey(key)) return null
		return getTimelineMetric(key)
	}, [metricParam])

	const visibleMetrics = useMemo(() => {
		if (activeMetric) return [activeMetric]
		return [...TIMELINE_METRICS]
	}, [activeMetric])

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

	useEffect(() => {
		if (hasPatientId) {
			form.setValue('patientId', patientId)
		}
	}, [form, hasPatientId, patientId])

	const onSubmit = useCallback(
		async (values: TFormValues) => {
			if (!hasPatientId) {
				form.setError('root', { message: 'Patient is required.' })
				return
			}
			if (!values.date?.trim()) {
				form.setError('root', { message: 'Date is required!' })
				return
			}

			const parsedVisible = visibleMetrics
				.map(metric =>
					parseTimelineMetricFormValue(
						metric,
						String(values.metrics?.[metric.key] ?? ''),
					),
				)
				.filter((item): item is NonNullable<typeof item> => item != null)

			if (!parsedVisible.length) {
				form.setError('root', {
					message: activeMetric
						? `Enter a ${activeMetric.label.toLowerCase()} value.`
						: 'Enter at least one measurement.',
				})
				return
			}

			const otherValues =
				activeMetric && data?.values
					? data.values
							.filter(item => item.key !== activeMetric.key)
							.map(item => ({
								key: item.key,
								value: item.value,
								unit: item.unit,
							}))
					: []

			try {
				const payload: TZPatientTimelineEntry = {
					id: values.id,
					patientId,
					date: values.date,
					note: values.note,
					values: [...otherValues, ...parsedVisible],
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
		[
			activeMetric,
			data?.values,
			form,
			hasPatientId,
			invalidateTimeline,
			patientId,
			submitEntry,
			visibleMetrics,
		],
	)

	const onRemove = useCallback(() => {
		const label = activeMetric?.label?.toLowerCase() ?? 'record'
		Alert.alert(
			'Remove',
			activeMetric
				? `Remove this ${label} reading?`
				: 'Are you sure you want to remove this entry?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Remove',
					onPress: async () => {
						if (!data?.id) return

						if (activeMetric) {
							const remaining = (data.values ?? [])
								.filter(item => item.key !== activeMetric.key)
								.map(item => ({
									key: item.key,
									value: item.value,
									unit: item.unit,
								}))

							if (remaining.length === 0) {
								await deleteEntry(data.id)
							} else {
								await submitEntry({
									id: data.id,
									patientId: data.patientId,
									date: data.date,
									note: data.note,
									values: remaining,
								})
							}
						} else {
							await deleteEntry(data.id)
						}

						invalidateTimeline()
						router.back()
					},
				},
			],
		)
	}, [activeMetric, data, deleteEntry, invalidateTimeline, submitEntry])

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

	if (gid !== 'new' && isPending) {
		return (
			<View className="flex-1 items-center justify-center px-4">
				<Stack.Screen options={{ title: 'Loading...' }} />
				<Spinner size="large" />
			</View>
		)
	}

	if (gid !== 'new' && !data) {
		return (
			<View className="flex-1 px-4">
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<Text>Record not found!</Text>
			</View>
		)
	}

	const title = activeMetric
		? data
			? `Update ${activeMetric.label}`
			: `Add ${activeMetric.label}`
		: data
			? 'Update Record'
			: 'New Record'

	return (
		<KeyboardAvoidingScrollView>
			<Stack.Screen options={{ title }} />
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
						{visibleMetrics.map(metric => (
							<GridItem key={metric.key} colSpan={2}>
								{metric.inputType === 'boolean' ? (
									<BaseSelect
										name={`metrics.${metric.key}`}
										label={metric.label}
										control={form.control}
										placeholder="Select"
										options={[...TIMELINE_BOOLEAN_OPTIONS]}
										getOptionLabel={option => option?.label}
										getOptionValue={option => option?.value}
									/>
								) : (
									<BaseInput
										name={`metrics.${metric.key}`}
										label={
											metric.unit
												? `${metric.label} (${metric.unit})`
												: metric.label
										}
										placeholder={
											'placeholder' in metric
												? metric.placeholder
												: undefined
										}
										keyboardType={
											metric.inputType === 'number'
												? 'decimal-pad'
												: 'default'
										}
										control={form.control}
									/>
								)}
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
