import { fs } from '@/utils/fs'
import { log } from '@/utils/logs'
import {
	createDownloadResumable,
	DownloadProgressData,
	DownloadResumable,
} from 'expo-file-system/legacy'
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'
import { useMMKVArray } from '../useMMKVArray'

const KEY = 'useDownloader:downloads'

type TDownloadItem = {
	id: string
	source: string
	destination: string
	status: 'paused' | 'auto-paused' | 'downloading' | 'completed' | 'failed'
	data?: any
	error?: string
	progress?: DownloadProgressData
	resumeData?: string
}

type TContext = {
	data: TDownloadItem[]
	download: (
		source: string,
		destination: string,
		resumeData?: string,
	) => Promise<any>
	pause: (source: string, destination: string) => void
	resume: (source: string, destination: string) => void
	remove: (item: TDownloadItem) => void
}

const Context = createContext<TContext>(null!)

export const Downloader = ({ children }: PropsWithChildren) => {
	const {
		data,
		update,
		unshift,
		getByKey,
		remove: arrayRemove,
	} = useMMKVArray<TDownloadItem>(KEY, {
		getKey: item => item.id,
	})

	const resumables = useRef<Record<string, DownloadResumable>>({})
	const appState = useRef(AppState.currentState)

	const pauseAllDownloads = useCallback(async () => {
		log(`[Downloader]: Pausing all downloads`)
		const pausePromises = Object.entries(resumables.current).map(
			async ([id, resumable]) => {
				if (typeof resumable.pauseAsync !== 'function') return
				try {
					const result = await resumable.pauseAsync()
					log(`[Downloader]: Paused download ${id}`)
					update({
						id,
						status: 'auto-paused',
						resumeData: result.resumeData,
					})
				} catch (error: any) {
					log(`[Downloader]: Error pausing download ${id}:`, error)
					update({
						id,
						status: 'failed',
						error: error.message,
					})
				}
			},
		)
		await Promise.allSettled(pausePromises)
	}, [update])

	const pause = useCallback(
		(source: string, destination: string) => {
			const id = `${source}-${destination}`
			console.log(`[Downloader]: Pausing ${id}`)
			const resumable = resumables.current[id]
			if (!resumable) return
			resumable
				.pauseAsync()
				.then(result => {
					update({
						id,
						status: 'paused',
						resumeData: result.resumeData,
					})
				})
				.catch(error => {
					update({
						id,
						status: 'failed',
						error: error.message,
					})
				})
		},
		[update],
	)

	const resume = useCallback((source: string, destination: string) => {
		const id = `${source}-${destination}`
		const resumable = resumables.current[id]
		if (!resumable) return
		resumable.resumeAsync()
	}, [])

	const download: TContext['download'] = useCallback(
		async (source, destination) => {
			//
			const id = `${source}-${destination}`

			// Already downloading or something
			if (resumables.current[id]) {
				console.log('[Downloader]: Already downloading or something')
				resume(source, destination)
				return
			}

			const existing = getByKey(id)

			// Already completed downloads are not downloaded again
			if (existing?.status === 'completed') {
				console.log(
					'[Downloader]: Already completed downloads are not downloaded again',
				)
				return
			}

			resumables.current[id] = createDownloadResumable(
				source,
				destination,
				{},
				progress => {
					update({
						id,
						progress,
						status:
							progress.totalBytesWritten >= progress.totalBytesExpectedToWrite
								? 'completed'
								: 'downloading',
					})
				},
				existing?.resumeData,
			)

			// Manually paused downloads are not resumed
			if (existing?.status === 'paused') {
				console.log('[Downloader]: Manually paused downloads are not resumed')
				return
			}

			if (existing) {
				update({
					id,
					status: 'downloading',
					data: undefined,
					error: undefined,
				})
				resume(source, destination)
				return
			}

			console.log(`[Downloader]: Unshifting ${id}`)
			unshift({
				id,
				source,
				destination,
				status: 'downloading',
			})

			try {
				console.log(`[Downloader]: downloadAsync ${id}`)
				const result = await resumables.current[id].downloadAsync()
				if (result) {
					update({
						id,
						status: 'completed',
						data: result,
					})
					return
				}
				throw new Error('No result')
			} catch (error: any) {
				update({
					id,
					status: 'failed',
					error: error.message,
				})
			}
			return
		},
		[resume, update, unshift, getByKey],
	)

	const remove = useCallback(
		async (item: TDownloadItem) => {
			Alert.alert(
				'Remove download',
				'Are you sure you want to remove this download?',
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Remove',
						onPress: async () => {
							const resumable = resumables.current[item.id]
							if (resumable) {
								await resumable.cancelAsync()
								delete resumables.current[item.id]
							}
							fs.remove(item.destination)
							arrayRemove(item.id)
						},
					},
				],
			)
		},
		[arrayRemove],
	)

	// Resume downloads on mount
	useEffect(() => {
		for (const v of data) {
			download(v.source, v.destination, v.resumeData)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Handle app state changes (background/foreground)
	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			(nextAppState: AppStateStatus) => {
				// Pause downloads when app goes to background or becomes inactive
				if (
					appState.current.match(/active/) &&
					(nextAppState === 'background' || nextAppState === 'inactive')
				) {
					log(
						`[Downloader]: App going to background/inactive, pausing downloads`,
					)
					pauseAllDownloads()
				}
				appState.current = nextAppState
			},
		)

		return () => {
			subscription.remove()
		}
	}, [pauseAllDownloads])

	// Cleanup: pause all downloads on unmount
	useEffect(() => {
		return () => {
			log(`[Downloader]: Component unmounting, pausing downloads`)
			// pauseAllDownloads()
		}
	}, [pauseAllDownloads])

	return (
		<Context.Provider
			value={{
				data,
				download,
				pause,
				resume,
				remove,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export const useDownloader = () => {
	const context = useContext(Context)
	if (!context)
		throw new Error('useDownloader must be used within a Downloader')
	return context
}
