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
}

const Context = createContext<TContext>(null!)

export const Downloader = ({ children }: PropsWithChildren) => {
	const { data, update, unshift, getByKey } = useMMKVArray<TDownloadItem>(KEY, {
		getKey: item => item.id,
	})

	const resumables = useRef<Record<string, DownloadResumable>>({})

	const pause = useCallback(
		(source: string, destination: string) => {
			const id = `${source}-${destination}`
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
				existing?.resumeData ||
					String(existing?.progress?.totalBytesWritten) ||
					undefined,
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

			unshift({
				id,
				source,
				destination,
				status: 'downloading',
			})

			try {
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

	useEffect(() => {
		for (const v of data) {
			download(v.source, v.destination, v.resumeData)
		}
		return () => {
			log(`[Downloader]: Pausing downloads`)
			Object.entries(resumables.current).forEach(([id, resumable]) => {
				resumable.pauseAsync().then(result => {
					log(`[Downloader]: Paused download ${id}`)
					update({
						id,
						status: 'auto-paused',
						resumeData: result.resumeData,
					})
				})
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Context.Provider
			value={{
				data,
				download,
				pause,
				resume,
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
