import { useCallback, useState } from 'react'

export const useModalState = () => {
	const [state, setState] = useState(0)
	return {
		visible: state > 0,
		open: useCallback(() => setState((v) => v + 1), []),
		close: useCallback(() => setState(0), []),
		onChangeVisible: useCallback((v: boolean) => {
			setState((x) => (v ? x : 0))
		}, []),
	}
}
