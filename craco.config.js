module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallback for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "next/link": false,
        "next/router": false,
        "next/head": false,
        "next/image": false,
        "next/script": false,
        "next/dynamic": false,
        "buffer": require.resolve("buffer"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util"),
        "process": require.resolve("process/browser.js"),
      };

      // Add Buffer polyfill
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new (require("webpack")).ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser.js",
        }),
      ];

      // Handle ES modules
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      return webpackConfig;
    },
  },
};
