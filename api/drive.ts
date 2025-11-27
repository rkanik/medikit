import { TAsset } from '@/types/database'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import mime from 'mime/lite'
import ReactNativeBlobUtil from 'react-native-blob-util'

const GET_API = 'https://www.googleapis.com/drive/v3'
const POST_API = 'https://www.googleapis.com/upload/drive/v3'
const ROOT_FOLDER = 'MediKit'

type TFile = TAsset & {
	folder?: string
}

type TFolderOptions = {
	name: string
	parent: string
	token: string
}

const findId = async (token: string, q: string) => {
	try {
		const r = await ReactNativeBlobUtil.fetch(
			'GET',
			`${GET_API}/files?q=${encodeURIComponent(q)}`,
			{
				Authorization: `Bearer ${token}`,
			},
		)
		const data = JSON.parse(r.data)
		return data.files?.[0]?.id || null
	} catch {
		return null
	}
}

const findFile = (v: TFolderOptions) => {
	return findId(
		v.token,
		`name='${v.name}' and '${v.parent}' in parents and trashed=false`,
	)
}

const findFolder = (v: TFolderOptions) => {
	return findId(
		v.token,
		`mimeType='application/vnd.google-apps.folder' and name='${v.name}' and '${v.parent}' in parents and trashed=false`,
	)
}

const createFolder = async (v: TFolderOptions) => {
	try {
		const r = await ReactNativeBlobUtil.fetch(
			'POST',
			`${GET_API}/files`,
			{
				Authorization: `Bearer ${v.token}`,
				'Content-Type': 'application/json',
			},
			JSON.stringify({
				name: v.name,
				mimeType: 'application/vnd.google-apps.folder',
				parents: [v.parent],
			}),
		)
		const json = JSON.parse(r.data)
		return json.id
	} catch {
		return null
	}
}

const folderIds = new Map<string, string>()
const getFolderId = async (v: TFolderOptions) => {
	const key = JSON.stringify({
		name: v.name,
		parent: v.parent,
	})
	if (folderIds.has(key)) return folderIds.get(key)
	const id = (await findFolder(v)) || (await createFolder(v))
	if (id) folderIds.set(key, id)
	return id
}

const upload = async (
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
) => {
	const tokenResponse = await GoogleSignin.getTokens()
	if (!tokenResponse?.accessToken) {
		const error = new Error('No access token found')
		options?.onError?.({
			data: [],
			error,
			errorCount: 0,
			successCount: 0,
		})
		return { error }
	}
	const token = tokenResponse.accessToken
	const rootFolderId = await getFolderId({
		token,
		name: ROOT_FOLDER,
		parent: 'root',
	})

	const results: any = []

	let errorCount = 0
	let successCount = 0

	for (let index = 0; index < files.length; index++) {
		const file = files[index]
		try {
			const parent = file.folder
				? await getFolderId({
						token,
						name: file.folder,
						parent: rootFolderId,
				  })
				: rootFolderId
			const name = file.uri?.split('/').pop()!
			const fileId = await findFile({ name, token, parent })
			const metadata = {
				...(fileId ? {} : { parents: [parent] }),
				name: file.uri?.split('/').pop(),
				mimeType: mime.getType(file.uri!),
			}
			const url = fileId
				? `${POST_API}/files/${fileId}?uploadType=multipart`
				: `${POST_API}/files?uploadType=multipart`
			const method = fileId ? 'PATCH' : 'POST'
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
	}
}

export const drive = {
	upload,
}
