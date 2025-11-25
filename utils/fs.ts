import { Directory, Paths } from 'expo-file-system'

const write = () => {
	const directory = new Directory(Paths.document, '')
}

const list = () => {
	const directory = new Directory(Paths.document)

	return directory.list()
}

export const fs = {
	write,
	list,
}
