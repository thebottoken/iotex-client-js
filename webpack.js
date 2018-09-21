const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const process = require('global/process');

const ANALYZE = false;
const PROD = process.env.NODE_ENV === 'production';
const OUTPUT_DIR = 'dist/';

module.exports = {
  mode: PROD ? 'production' : 'development',
  entry: './src/main.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, OUTPUT_DIR),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: require('./babel.config'),
        },
      },
    ],
  },
  plugins: [
    ...(ANALYZE ? [new BundleAnalyzerPlugin()] : []),
    ...(PROD ? [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
    ] : []),
  ],
};
