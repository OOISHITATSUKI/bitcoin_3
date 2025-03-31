module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "zlib": require.resolve("browserify-zlib"),
          "util": require.resolve("util/"),
          "url": require.resolve("url/"),
          "assert": require.resolve("assert/"),
          "buffer": require.resolve("buffer/"),
          "process": require.resolve("process/browser")
        }
      }
    }
  }
}; 