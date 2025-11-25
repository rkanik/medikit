import * as ImagePicker from 'expo-image-picker'
import { useEffect, useMemo, useState } from 'react'
import { Alert, FlatList, Image, Text, TextInput, View } from 'react-native'

import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { useMedicalRecords } from '@/hooks/useMedicalRecords'
import type { MedicalAttachment } from '@/types/medical'
import { copyIntoMedikitDirAsync, deleteFileIfExistsAsync } from '@/utils/fs'
import { createId } from '@/utils/id'

type FormState = {
	title: string
	notes: string
	doctor: string
	amount: string
}

const initialForm: FormState = {
	title: '',
	notes: '',
	doctor: '',
	amount: '',
}

export default function RecordsScreen() {
	const { records, addRecord, removeRecord } = useMedicalRecords()
	const [form, setForm] = useState<FormState>(initialForm)
	const [attachments, setAttachments] = useState<MedicalAttachment[]>([])

	useEffect(() => {
		ImagePicker.requestMediaLibraryPermissionsAsync().then(({ status }) => {
			if (status !== 'granted') {
				Alert.alert(
					'Permission needed',
					'Please allow gallery access to attach prescriptions.',
				)
			}
		})
	}, [])

	const totalSpent = useMemo(
		() => records.reduce((sum, record) => sum + (record.amount ?? 0), 0),
		[records],
	)

	const handlePickAttachment = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 0.7,
		})

		if (result.canceled || !result.assets?.length) {
			return
		}

		const asset = result.assets[0]
		const fileName = asset.fileName ?? `attachment-${Date.now()}.jpg`
		const storedUri = await copyIntoMedikitDirAsync({
			sourceUri: asset.uri,
			fileName,
			subDir: 'attachments',
		})

		setAttachments(prev => [
			...prev,
			{
				id: createId(),
				name: fileName,
				uri: storedUri,
				mimeType: asset.mimeType ?? 'image/jpeg',
				type: 'other',
				size: asset.fileSize,
			},
		])
	}

	const handleCreateRecord = () => {
		try {
			addRecord({
				title: form.title,
				notes: form.notes,
				doctor: form.doctor,
				amount: form.amount ? Number(form.amount) : undefined,
				attachments,
			})
			setForm(initialForm)
			setAttachments([])
			Alert.alert('Record saved', 'Your medical history entry was created.')
		} catch (error: any) {
			Alert.alert('Unable to save', error.message)
		}
	}

	const handleRemoveAttachment = async (attachment: MedicalAttachment) => {
		await deleteFileIfExistsAsync(attachment.uri)
		setAttachments(prev => prev.filter(item => item.id !== attachment.id))
	}

	return (
		<Box className="flex-1 px-4 py-6 gap-4">
			<View className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 gap-2">
				<Text className="text-lg font-semibold text-black dark:text-white">
					New record
				</Text>
				<TextInput
					placeholder="Title (e.g. Dentist Visit)"
					value={form.title}
					onChangeText={text => setForm(prev => ({ ...prev, title: text }))}
					className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-black dark:text-white"
					placeholderTextColor="#9ca3af"
				/>
				<TextInput
					placeholder="Doctor or clinic"
					value={form.doctor}
					onChangeText={text => setForm(prev => ({ ...prev, doctor: text }))}
					className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-black dark:text-white"
					placeholderTextColor="#9ca3af"
				/>
				<TextInput
					placeholder="Notes"
					multiline
					value={form.notes}
					onChangeText={text => setForm(prev => ({ ...prev, notes: text }))}
					className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-black dark:text-white h-20"
					placeholderTextColor="#9ca3af"
				/>
				<TextInput
					placeholder="Amount spent"
					keyboardType="decimal-pad"
					value={form.amount}
					onChangeText={text => setForm(prev => ({ ...prev, amount: text }))}
					className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-black dark:text-white"
					placeholderTextColor="#9ca3af"
				/>
				<View className="gap-2">
					<View className="flex-row items-center justify-between">
						<Text className="text-base font-medium text-black dark:text-white">
							Attachments
						</Text>
						<Button size="sm" variant="outline" onPress={handlePickAttachment}>
							<ButtonText>Add photo</ButtonText>
						</Button>
					</View>
					{attachments.length === 0 ? (
						<Text className="text-sm text-slate-500">
							No files selected yet.
						</Text>
					) : (
						<FlatList
							horizontal
							data={attachments}
							keyExtractor={item => item.id}
							contentContainerStyle={{ gap: 12 }}
							renderItem={({ item }) => (
								<View className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
									<Image
										source={{ uri: item.uri }}
										style={{ width: '100%', height: '100%' }}
									/>
									<Text
										onPress={() => handleRemoveAttachment(item)}
										className="absolute right-2 top-2 p-1 rounded-full bg-black/60 text-white text-xs"
									>
										✕
									</Text>
								</View>
							)}
						/>
					)}
				</View>
				<Button onPress={handleCreateRecord}>
					<ButtonText>Save record</ButtonText>
				</Button>
			</View>

			<View className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 gap-2 flex-1">
				<Text className="text-lg font-semibold text-black dark:text-white">
					Saved histories
				</Text>
				<Text className="text-slate-500 text-sm">
					{records.length} entries • ৳{totalSpent.toFixed(2)} spent
				</Text>
				<FlatList
					data={records}
					keyExtractor={item => item.id}
					style={{ marginTop: 8 }}
					ItemSeparatorComponent={() => (
						<View className="h-px bg-slate-200 dark:bg-slate-800 my-3" />
					)}
					renderItem={({ item }) => (
						<View className="gap-1">
							<View className="flex-row justify-between items-center">
								<Text className="text-base font-semibold text-black dark:text-white">
									{item.title}
								</Text>
								<Text className="text-sm text-slate-500">
									{new Date(item.createdAt).toLocaleDateString()}
								</Text>
							</View>
							{item.doctor ? (
								<Text className="text-sm text-slate-500">{item.doctor}</Text>
							) : null}
							{item.notes ? (
								<Text className="text-sm text-slate-600">{item.notes}</Text>
							) : null}
							<View className="flex-row justify-between items-center mt-2">
								<Text className="text-sm text-slate-500">
									{item.attachments.length} attachments
								</Text>
								<Button
									size="sm"
									variant="outline"
									onPress={() =>
										Alert.alert(
											'Delete record',
											'This will remove the record and its attachments.',
											[
												{ text: 'Cancel', style: 'cancel' },
												{
													text: 'Delete',
													style: 'destructive',
													onPress: async () => {
														await Promise.all(
															item.attachments.map(attachment =>
																deleteFileIfExistsAsync(attachment.uri),
															),
														)
														removeRecord(item.id)
													},
												},
											],
										)
									}
								>
									<ButtonText>Delete</ButtonText>
								</Button>
							</View>
						</View>
					)}
				/>
			</View>
		</Box>
	)
}
