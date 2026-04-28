import { FileManager } from '@/components/base/FileManager'
import { Stack } from 'expo-router'
import { Fragment } from 'react'

export default function Screen() {
	return (
		<Fragment>
			<Stack.Screen options={{ title: 'File Manager' }} />
			<FileManager />
		</Fragment>
	)
}
