import type { PropsWithChildren } from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'
import {
	Modal,
	ScrollView,
	StyleSheet,
	ToastAndroid,
	useWindowDimensions,
	View,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
} from 'react-native'
import { Image } from 'expo-image'
import { shareAsync } from 'expo-sharing'
import { GestureViewer } from 'react-native-gesture-image-viewer'
import { BaseActions } from '@/components/base/actions'
import { saveToDownloads } from '@/utils/saveToDownloads'

type TAsset = { uri?: string }

type TContext = {
	openImageViewer: (assets: TAsset[], index?: number) => void
}

const Context = createContext<TContext>(null!)

export const ImageViewerProvider = ({ children }: PropsWithChildren) => {
	const { width } = useWindowDimensions()
	const [urls, setUrls] = useState<string[]>([])
	const [initialIndex, setInitialIndex] = useState(0)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [visible, setVisible] = useState(false)

	const onDismiss = useCallback(() => {
		setVisible(false)
	}, [])

	const openImageViewer = useCallback((assets: TAsset[], index = 0) => {
		const urls = assets.filter(v => !!v.uri).map(asset => asset.uri!)
		if (!assets.length) return
		setUrls(urls)
		setInitialIndex(index)
		setCurrentIndex(index)
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
		shareAsync(urls[currentIndex])
	}, [urls, currentIndex])

	const onDownload = useCallback(() => {
		saveToDownloads(urls[currentIndex])
			.then(result => {
				ToastAndroid.show(
					result.skipped
						? 'Already in Downloads'
						: 'Saved to Downloads',
					ToastAndroid.SHORT,
				)
			})
			.catch(() => {
				ToastAndroid.show('Failed to save to Downloads', ToastAndroid.SHORT)
			})
	}, [urls, currentIndex])

	const listProps = useMemo(
		() => ({
			onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const scrollIndex = Math.round(
					event.nativeEvent.contentOffset.x / width,
				)
				if (scrollIndex >= 0 && scrollIndex < urls.length) {
					setCurrentIndex(scrollIndex)
				}
			},
		}),
		[width, urls.length],
	)

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
						initialIndex={initialIndex}
						onDismiss={onDismiss}
						renderItem={renderItem}
						ListComponent={ScrollView}
						listProps={listProps}
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
											pill: true,
											prependIcon: 'share-2',
											onPress: onShare,
										},
										{
											pill: true,
											prependIcon: 'download',
											onPress: onDownload,
										},
										{
											pill: true,
											prependIcon: 'chevron-down',
											title: 'Close',
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
