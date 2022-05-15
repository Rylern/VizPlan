const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
process.env.NODE_ENV = 'production'

module.exports = {
	entry: './src/js/index.ts',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					process.env.NODE_ENV !== 'production'
						? 'style-loader'
						: MiniCssExtractPlugin.loader,
					// Translates CSS into CommonJS
					'css-loader',
					// Compiles Sass to CSS
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'style/[name].css',
			chunkFilename: '[id].css'
		}),
		new CopyPlugin({
			patterns: [
				{ from: './public/**/*', to: '', force: true },
				{ from: './src/html/*', force: true, flatten: true }
			]
		})
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			'@lib': path.resolve(__dirname, 'src/js/lib'),
			'@helpers': path.resolve(__dirname, 'src/js/helpers'),
			'@models': path.resolve(__dirname, 'src/js/models'),
			'@js': path.resolve(__dirname, 'src/js')
		}
	},
	output: {
		filename: 'js/bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	devServer: {
		static: {
			directory: path.join(__dirname, './dist/')
		},
		compress: true,
		hot: true,
		port: 9000,
		onBeforeSetupMiddleware: devServer => {
			const message = "You are currently using the front development mode. Consider using the back development mode to test this fonctionnality.";
			devServer.app.post('/defineKPI', function(req, res) {
				res.send(message);
			});
			devServer.app.post('/addArea', function(req, res) {
				res.send(message);
			});
			devServer.app.post('/editArea', function(req, res) {
				res.send(message);
			});
			devServer.app.post('/deleteArea', function(req, res) {
				res.send(message);
			});
		}
	}
}
