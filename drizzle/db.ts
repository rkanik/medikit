import { drizzle } from 'drizzle-orm/expo-sqlite'
import { Directory, File, Paths } from 'expo-file-system'
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite'

import * as schema from './schema'

const SQLITE_DIR = 'SQLite'
const DB_NAME = 'index.db'

const getDatabaseDirectory = () => {
	const directory = new Directory(Paths.document, SQLITE_DIR)
	directory.create({ idempotent: true, intermediates: true })
	return directory
}

const getDatabaseFile = () => new File(Paths.document, SQLITE_DIR, DB_NAME)

const openAppDatabase = () => {
	const directory = getDatabaseDirectory()
	return openDatabaseSync(DB_NAME, {}, directory.uri)
}

let sqlite: SQLiteDatabase = openAppDatabase()

export let db = drizzle(sqlite, { schema })

export const replaceDatabaseFromCache = () => {
	const source = new File(Paths.cache, DB_NAME)
	if (!source.exists) {
		throw new Error('Database backup file not found in cache')
	}

	getDatabaseDirectory()
	const target = getDatabaseFile()

	sqlite.closeSync()

	if (target.exists) {
		target.delete()
	}

	source.copy(target)

	const info = target.info()
	if (!info.exists || !info.size) {
		throw new Error('Failed to restore database file')
	}

	sqlite = openAppDatabase()
	db = drizzle(sqlite, { schema })
}
