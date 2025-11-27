import { createMMKV } from 'react-native-mmkv'
import { fs } from './fs'

export const storage = createMMKV()

export const createFile = <T = any, R = any>(options: {
	name: string
	overwrite?: boolean
	map?: (item: T, index: number) => R | T
}) => {
	try {
		const items: T[] = JSON.parse(storage.getString(options.name)!)
		const file = fs.createJsonFile(
			items.map(options.map ?? (item => item)),
			`${options.name}.json`,
		)
		return {
			...file,
			overwrite: options.overwrite ?? false,
		}
	} catch {
		return null
	}
}
