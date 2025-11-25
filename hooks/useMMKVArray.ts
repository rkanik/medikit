import { useCallback } from 'react'
import { useMMKVObject } from 'react-native-mmkv'

export const useMMKVArray = <T, K = any>(
	key: string,
	options?: {
		getKey?: (item: T) => K
	},
) => {
	const [data = [], setData] = useMMKVObject<T[]>(key)

	const getKey = useCallback(
		(item: T) => {
			return options?.getKey?.(item) ?? ((v: T) => v)
		},
		[options],
	)

	const push = useCallback(
		(item: T) => {
			setData((data = []) => {
				return [...data, item]
			})
		},
		[setData],
	)

	const update = useCallback(
		(item: T) => {
			setData((data = []) => {
				return data.map(v => {
					if (getKey(v) === getKey(item)) {
						return {
							...v,
							...item,
						}
					}
					return v
				})
			})
		},
		[getKey, setData],
	)

	const getByKey = useCallback(
		(key: K) => {
			return data.find(item => {
				return getKey(item) === key
			})
		},
		[data, getKey],
	)

	const remove = useCallback(
		(key: K) => {
			setData((data = []) => {
				return data.filter(v => {
					return getKey(v) !== key
				})
			})
		},
		[getKey, setData],
	)

	return {
		data,
		push,
		update,
		remove,
		getByKey,
		setData,
	}
}
