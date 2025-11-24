/* eslint-disable react-hooks/exhaustive-deps */
import type { DependencyList } from 'react'
import { useEffect, useMemo, useState } from 'react'

export const useMemoState = <T>(source: () => T, deps: DependencyList) => {
	const [state, setState] = useState(source)
	const memo = useMemo(source, deps)
	useEffect(() => setState(memo), [memo])
	return [state, setState] as const
}
