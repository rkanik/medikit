import { File } from 'expo-file-system'
import { startActivityAsync } from 'expo-intent-launcher'
import { isAndroid } from './is'

const openApk = (url: string) => {
	return startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
		data: new File(url).contentUri,
		flags: (1 << 0) | (1 << 1),
		type: 'application/vnd.android.package-archive',
		extra: {
			'android.intent.extra.NOT_UNKNOWN_SOURCE': true,
		},
	})
}

export const open = (url: string) => {
	if (!isAndroid) return
	if (url.endsWith('.apk')) {
		return openApk(url)
	}
}
