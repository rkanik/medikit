import type { TMaybe } from '@/types'
import type { GetTokensResponse } from '@react-native-google-signin/google-signin'
import type { Directory } from 'expo-file-system'

import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { File } from 'expo-file-system'
import mime from 'mime/lite'
import ReactNativeBlobUtil from 'react-native-blob-util'

import { appName } from '@/const'
import { log } from '@/utils/logs'

const GET_API = 'https://www.googleapis.com/drive/v3'
const POST_API = 'https://www.googleapis.com/upload/drive/v3'

type TFile = {
	uri: string
	fileId?: string
}

type TDriveFile = {
	id: string
	name: string
	mimeType: string
	parents: string[]
}

type TSuccessResponse<T = any> = {
	data: T
	error: null
}

type TErrorResponse = {
	data: null
	error: Error
}

type TResponse<T = any> = Promise<TSuccessResponse<T> | TErrorResponse>

type TFindQuery = {
	names?: string[]
	mimeTypes?: string[]
}

export class GoogleDrive {
	private token: string | null = null
	private folderIds = new Map<string, string>()
	private tokenPromise: Promise<GetTokensResponse> | null = null

	constructor(public rootFolder = appName) {
		//
	}

	private async getToken() {
		try {
			if (this.token) return this.token

			this.tokenPromise = this.tokenPromise || GoogleSignin.getTokens()
			const response = await this.tokenPromise

			this.token = response.accessToken
			this.tokenPromise = null

			return this.token
		} catch (error) {
			log('Error getting google access token:', error)
			this.token = null
			this.tokenPromise = null
			return null
		}
	}

	private async withToken<T>(
		callback: (token: string) => Promise<T>,
		onError?: (error: Error) => void,
	) {
		const token = await this.getToken()
		if (!token) {
			const error = new Error('No access token found')
			onError?.(error)
			return {
				error,
				data: null,
			}
		}
		return callback(token)
	}

	private async findFolderId(
		name: string,
		parent?: TMaybe<string>,
	): TResponse<string> {
		return this.withToken(async token => {
			try {
				const r = await ReactNativeBlobUtil.fetch(
					'GET',
					`${GET_API}/files?q=${encodeURIComponent(
						[
							`mimeType='application/vnd.google-apps.folder'`,
							`name='${name}'`,
							parent ? `'${parent}' in parents` : false,
							`trashed=false`,
						]
							.filter(Boolean)
							.join(' and '),
					)}`,
					{
						Authorization: `Bearer ${token}`,
					},
				)
				const data = JSON.parse(r.data)
				if (data.files?.[0]?.id) {
					return {
						data: data.files?.[0]?.id,
						error: null,
					}
				}
				throw new Error('Failed to find folder')
			} catch (error) {
				return {
					data: null,
					error: error as Error,
				}
			}
		})
	}

	private async createFolder(
		name: string,
		parents: string[],
	): TResponse<string> {
		return this.withToken(async token => {
			try {
				const r = await ReactNativeBlobUtil.fetch(
					'POST',
					`${GET_API}/files`,
					{
						[`Content-Type`]: 'application/json',
						[`Authorization`]: `Bearer ${token}`,
					},
					JSON.stringify({
						name,
						parents,
						mimeType: 'application/vnd.google-apps.folder',
					}),
				)
				const json = JSON.parse(r.data)
				return {
					data: json.id,
					error: null,
				}
			} catch (error) {
				return {
					data: null,
					error: error as Error,
				}
			}
		})
	}

	private async getFolderId(
		name: string,
		parent?: TMaybe<string>,
	): TResponse<string> {
		const key = JSON.stringify({ name, parent })
		if (this.folderIds.has(key)) {
			return {
				data: this.folderIds.get(key)!,
				error: null,
			}
		}
		const { data, error } =
			(await this.findFolderId(name, parent)) ||
			(await this.createFolder(name, parent ? [parent] : []))
		if (data) {
			this.folderIds.set(key, data)
			return {
				data,
				error: null,
			}
		}
		return {
			data: null,
			error: error as Error,
		}
	}

	private async getRootFolderId() {
		return this.getFolderId(this.rootFolder, 'root').then(v => v.data as string)
	}

	public async download(id: string, destination: Directory | File) {
		return this.withToken(async token => {
			return File.downloadFileAsync(
				`${GET_API}/files/${id}?alt=media`,
				destination,
				{
					idempotent: true,
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
		})
	}

	public async find(query?: TFindQuery): TResponse<TDriveFile[]> {
		return this.withToken(async token => {
			const queries: string[] = ['trashed=false']
			if (query?.names) {
				queries.push(
					`(${query.names.map(name => `name='${name}'`).join(' or ')})`,
				)
			}

			if (query?.mimeTypes) {
				queries.push(
					`(${query.mimeTypes
						.map(mimeType => `mimeType='${mimeType}'`)
						.join(' or ')})`,
				)
			}

			const id = await this.getRootFolderId()
			if (id) queries.push(`'${id}' in parents`)

			const params = new URLSearchParams({
				q: queries.join(' and '),
				fields: 'files(id,name,mimeType)',
			})

			try {
				const r = await ReactNativeBlobUtil.fetch(
					'GET',
					`${GET_API}/files?${params.toString()}`,
					{
						Authorization: `Bearer ${token}`,
					},
				)
				const data = JSON.parse(r.data)
				return {
					data: (data.files ?? []) as TDriveFile[],
					error: null,
				}
			} catch (error) {
				return {
					data: null,
					error: error as Error,
				}
			}
		})
	}

	public async delete(ids: string[]) {
		return this.withToken(async token => {
			const results: any = []
			for (const id of ids) {
				try {
					const r = await ReactNativeBlobUtil.fetch(
						'DELETE',
						`${GET_API}/files/${id}`,
						{
							Authorization: `Bearer ${token}`,
						},
					)
					results.push({ data: r.data })
				} catch (error) {
					results.push({ error })
				}
			}
			return {
				data: results,
			}
		})
	}

	public async upload(
		files: TFile[],
		options?: {
			onError?: (event: {
				data?: any[]
				error: any
				errorCount: number
				successCount: number
			}) => void
			onComplete?: (event: {
				data: any[]
				errorCount: number
				successCount: number
			}) => void
			onProgress?: (event: {
				file: TFile
				data: any
				error: any
				total: number
				index: number
				progress: number
				errorCount: number
				successCount: number
			}) => void
		},
	) {
		return this.withToken(
			async token => {
				const results: any = []
				const rootFolderId = await this.getRootFolderId()

				let errorCount = 0
				let successCount = 0

				for (let index = 0; index < files.length; index++) {
					const file = files[index]
					try {
						const metadata = {
							...(file.fileId ? {} : { parents: [rootFolderId] }),
							name: file.uri.split('/').pop(),
							mimeType: mime.getType(file.uri!),
						}

						const url = file.fileId
							? `${POST_API}/files/${file.fileId}?uploadType=multipart`
							: `${POST_API}/files?uploadType=multipart`

						const method = file.fileId ? 'PATCH' : 'POST'
						const response = await ReactNativeBlobUtil.fetch(
							method,
							url,
							{
								Authorization: `Bearer ${token}`,
								'Content-Type': 'multipart/form-data',
							},
							[
								{
									name: 'metadata',
									data: JSON.stringify(metadata),
								},
								{
									name: 'file',
									type: metadata.mimeType,
									filename: metadata.name,
									data: ReactNativeBlobUtil.wrap(file.uri!),
								},
							],
						)
						const data = JSON.parse(response.data)
						successCount++
						options?.onProgress?.({
							file,
							data,
							error: null,
							total: files.length,
							index,
							successCount,
							errorCount,
							progress: ((index + 1) / files.length) * 100,
						})
						results.push({ data })
					} catch (error) {
						errorCount++
						options?.onProgress?.({
							file,
							error,
							data: null,
							total: files.length,
							index,
							successCount,
							errorCount,
							progress: ((index + 1) / files.length) * 100,
						})
					}
				}
				options?.onComplete?.({
					data: results,
					errorCount,
					successCount,
				})
				return {
					results,
					error: null,
				}
			},
			error => {
				options?.onError?.({
					data: [],
					error,
					errorCount: 0,
					successCount: 0,
				})
			},
		)
	}
}
