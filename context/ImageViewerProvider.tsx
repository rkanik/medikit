import type { PropsWithChildren } from 'react'

import { createContext, useCallback, useContext, useState } from 'react'
import { Modal, ScrollView, StyleSheet, ToastAndroid, View } from 'react-native'

import { Image } from 'expo-image'
import { saveToLibraryAsync } from 'expo-media-library'
import { shareAsync } from 'expo-sharing'
import { GestureViewer } from 'react-native-gesture-image-viewer'

import { BaseActions } from '@/components/base/actions'

type TAsset = { uri?: string }

type TContext = {
	openImageViewer: (assets: TAsset[], index?: number) => void
}

const Context = createContext<TContext>(null!)

export const ImageViewerProvider = ({ children }: PropsWithChildren) => {
	const [urls, setUrls] = useState<string[]>([])
	const [index, setIndex] = useState(0)
	const [visible, setVisible] = useState(false)

	const onDismiss = useCallback(() => {
		setVisible(false)
	}, [])

	const openImageViewer = useCallback((assets: TAsset[], index = 0) => {
		const urls = assets.filter(v => !!v.uri).map(asset => asset.uri!)
		if (!assets.length) return
		setUrls(urls)
		setIndex(index)
		setVisible(true)
	}, [])

	const renderItem = useCallback(
		(uri: string) => (
			<Image
				source={{ uri }}
				style={styles.image}
				contentFit="contain"
				contentPosition="center"
			/>
		),
		[],
	)

	const onShare = useCallback(() => {
		shareAsync(urls[index])
	}, [urls, index])

	const onDownload = useCallback(() => {
		saveToLibraryAsync(urls[index])
			.then(() => {
				ToastAndroid.show('Saved to gallery', ToastAndroid.SHORT)
			})
			.catch(() => {
				ToastAndroid.show('Failed to save to gallery', ToastAndroid.SHORT)
			})
	}, [urls, index])

	// const onDelete = useCallback(() => {
	// 	setUrls(urls.filter((_, i) => i !== index))
	// }, [urls, index])

	return (
		<Context.Provider value={{ openImageViewer }}>
			{children}
			{visible && urls.length > 0 && (
				<Modal
					transparent
					visible={visible}
					animationType="fade"
					onRequestClose={onDismiss}
				>
					<GestureViewer
						data={urls}
						initialIndex={index}
						onDismiss={onDismiss}
						renderItem={renderItem}
						ListComponent={ScrollView}
						renderContainer={(children, { dismiss }) => (
							<View className="flex-1">
								{children}
								<BaseActions
									className="bottom-12"
									data={[
										// {
										// 	icon: 'trash-2',
										// 	onPress: onDelete,
										// },
										{
											icon: 'share-2',
											onPress: onShare,
										},
										{
											icon: 'download',
											onPress: onDownload,
										},
										{
											icon: 'chevron-down',
											text: 'Close',
											onPress: dismiss,
										},
									]}
								/>
							</View>
						)}
					/>
				</Modal>
			)}
		</Context.Provider>
	)
}

export const useImageViewer = () => {
	const context = useContext(Context)
	if (!context) {
		throw new Error('useImageViewer must be used within a ImageViewerProvider')
	}
	return context
}

const styles = StyleSheet.create({
	image: {
		width: '100%',
		height: '100%',
	},
})
