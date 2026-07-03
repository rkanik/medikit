// Metro parses `.sql` migration files as JS when they are listed in `resolver.sourceExts`.
// Wrap SQL as a default-exported string before Babel runs (see drizzle/migrations.js).
const expoBabelTransformer = require('@expo/metro-config/babel-transformer')

module.exports.transform = function transform(params) {
	const { filename, src } = params
	if (filename.endsWith('.sql')) {
		const js = `export default ${JSON.stringify(src)};`
		return expoBabelTransformer.transform({
			...params,
			src: js,
			filename: `${filename}.js`,
		})
	}
	return expoBabelTransformer.transform(params)
}
