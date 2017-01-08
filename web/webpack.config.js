var LiveReloadPlugin = require('webpack-livereload-plugin');
var webpack          = require('webpack')

module.exports = {
    entry: __dirname + "/scripts/index.js",
    output: {
        path: __dirname + '/scripts/',
        filename: "index.min.js"
        // libraryTarget: 'commonjs2'
    },
    watch:true,
    devtool: 'source-map',
    debug: true,
    devtool: 'source-map',
    plugins: [
        new LiveReloadPlugin(),
        new webpack.DefinePlugin({
            'process.env': { 'NODE_ENV': '"development"' }
        })
        // new webpack.DefinePlugin({
        //     'process.env': { 'NODE_ENV': '"production"' }
        // })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-0', 'react']
                }
            },{
                test: /\.global\.css$/,
                loaders: ['style-loader', 'css-loader?sourceMap']
            },{
                test: /^((?!\.global).)*\.css$/,
                loaders: [
                    'style-loader', 'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[h' +
                            'ash:base64:5]'
                ]
            },{
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            },{
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            },{
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/octet-stream'
            },{
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file'
            },{
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=image/svg+xml'
            },{
                test: /\.(jp?g|png|gif)$/i,
                loader:'file'
            },{
              test: /\.jsx?$/,
              loaders: ['babel-loader'],
              exclude: /node_modules/
            },{
              test: /\.json$/,
              loader: 'json-loader'
            }
        ]
    },
    // resolve:{
    //     extensions: ['', '.js', '.jsx', '.json'],
    //     packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
    // }
};
