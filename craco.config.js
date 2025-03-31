const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "assert": require.resolve("assert/"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "url": require.resolve("url/"),
          "buffer": require.resolve("buffer/"),
          "zlib": require.resolve("browserify-zlib")
        }
      }
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
      ]
    }
  }
}; 