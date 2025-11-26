import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { ChevronDownIcon } from 'lucide-react-native'
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import {
	GestureViewer,
	useGestureViewerController,
} from 'react-native-gesture-image-viewer'

type TAsset = { uri?: string }

type TContext = {
	openImageViewer: (assets: TAsset[], index?: number) => void
}

const Context = createContext<TContext>(null!)

export const ImageViewerProvider = ({ children }: PropsWithChildren) => {
	const [urls, setUrls] = useState<string[]>([])
	const [index, setIndex] = useState(0)
	const [visible, setVisible] = useState(false)

	const { goToIndex } = useGestureViewerController()

	const onDismiss = useCallback(() => {
		setVisible(false)
	}, [])

	const openImageViewer = useCallback(
		(assets: TAsset[], index = 0) => {
			const urls = assets.filter(v => !!v.uri).map(asset => asset.uri as string)
			if (!assets.length) return
			setIndex(index)
			setUrls(urls)
			setVisible(true)
			goToIndex(index)
			console.log('openImageViewer', index)
		},
		[goToIndex],
	)

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

	console.log({ index })

	return (
		<Context.Provider value={{ openImageViewer }}>
			{children}
			{visible && urls.length > 0 && (
				<Modal
					transparent
					statusBarTranslucent
					visible={visible}
					animationType="fade"
					onRequestClose={onDismiss}
					presentationStyle="fullScreen"
				>
					<GestureViewer
						data={urls}
						initialIndex={index}
						onDismiss={onDismiss}
						renderItem={renderItem}
						ListComponent={FlashList}
						renderContainer={(children, { dismiss }) => (
							<View className="flex-1">
								{children}
								<View
									style={{ bottom: 64 }}
									className="absolute left-0 right-0 flex-row justify-center"
								>
									<Button
										size="xl"
										variant="outline"
										className="rounded-full"
										onPress={dismiss}
									>
										<ButtonIcon as={ChevronDownIcon} size="lg" />
										<ButtonText size="md">Close</ButtonText>
									</Button>
								</View>
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
