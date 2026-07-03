const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

config.resolver.sourceExts.push('sql')

const nativeWindConfig = withNativeWind(config, {
	input: './global.css',
})

nativeWindConfig.transformer = {
	...nativeWindConfig.transformer,
	babelTransformerPath: require.resolve('./metro.transformer.js'),
}

module.exports = nativeWindConfig
