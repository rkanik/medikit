import { TAsset } from '@/types/database'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import mime from 'mime/lite'
import ReactNativeBlobUtil from 'react-native-blob-util'

const GET_API = 'https://www.googleapis.com/drive/v3'
const POST_API = 'https://www.googleapis.com/upload/drive/v3'
const ROOT_FOLDER = 'MediKit'

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

const upload = async (files: (TAsset & { folder?: string })[]) => {
	const tokenResponse = await GoogleSignin.getTokens()
	if (!tokenResponse?.accessToken) {
		return {
			error: 'No access token found',
		}
	}
	const token = tokenResponse.accessToken
	const rootFolderId = await getFolderId({
		token,
		name: ROOT_FOLDER,
		parent: 'root',
	})

	const data: any = []
	for (const file of files) {
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
			if (fileId) {
				data.push({
					data: {
						id: fileId,
					},
				})
				continue
			}
			const metadata = {
				parents: [parent],
				name: file.uri?.split('/').pop(),
				mimeType: mime.getType(file.uri!),
			}
			const response = await ReactNativeBlobUtil.fetch(
				'POST',
				`${POST_API}/files?uploadType=multipart`,
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
			data.push({
				data: JSON.parse(response.data),
			})
		} catch (error) {
			data.push({
				error,
			})
		}
	}
	return {
		data,
	}
}

export const drive = {
	upload,
}
