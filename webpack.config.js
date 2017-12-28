var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const moment = require("moment-timezone");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

let banner =
  "Webpack build information: " +
  "\n" +
  moment()
    .tz("America/Chicago")
    .format("dddd, MMMM Do YYYY, h:mm:ss a") +
  "\nhttps://github.com/ICJIA/icjia-ari-map-demo" +
  "\nARI Map Injection Test" +
  "\ncja.irc@illinois.gov";

module.exports = {
  entry: "./vue/main.js",
  output: {
    path: path.resolve(__dirname, "./dist/"),
    publicPath: "",
    // publicPath: "/dist/",
    filename: "js/webpack.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"]
      },
      {
        test: /moment\.js$/,
        loader: "expose-loader?moment"
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*$|$)/,
        loader: "file-loader"
      },
      // {
      //     test: /\.scss$/,
      //     use: [
      //         'vue-style-loader',
      //         'css-loader',
      //         'sass-loader'
      //     ],
      // },
      // {
      //     test: /\.sass$/,
      //     use: [
      //         'vue-style-loader',
      //         'css-loader',
      //         'sass-loader?indentedSyntax'
      //     ],
      // },
      {
        test: /\.sass$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader!sass-loader?indentedSyntax"
        })
      },
      {
        test: /\.(scss|css)$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader!sass-loader"
        })
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            scss: ["vue-style-loader", "css-loader", "sass-loader"],
            sass: [
              "vue-style-loader",
              "css-loader",
              "sass-loader?indentedSyntax"
            ]
          },
          extractCSS: true
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]"
        }
      }
    ]
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   $: "jquery",
    //   jQuery: "jquery",
    //   "window.jQuery": "jquery",
    //   Popper: ["popper.js", "default"]
    // }),
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: "./index.ejs",
      // filename: './layouts/default.html',
      // template: 'node_modules/cschweda-webpack-template/index.ejs',

      // Optional
      // minify: {
      //   collapseWhitespace: true,
      //   caseSensitive: true
      // },
      appMountId: "Illinois",
      appMountClass: "__vue-root",
      baseHref: "/",
      meta: [
        {
          name: "description",
          content: "A better default template for html-webpack-plugin."
        }
      ],
      mobile: true,
      lang: "en-US",
      links: [
        "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
      ],
      inlineManifestWebpackName: "webpackManifest",
      scripts: [
        "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
      ],
      headscripts: [
        "https://code.jquery.com/jquery-3.2.1.slim.js",
        "https://unpkg.com/fusioncharts/fusioncharts.js",
        "https://unpkg.com/fusioncharts/fusioncharts.charts.js",
        "https://unpkg.com/fusioncharts/fusioncharts.maps.js"
        // "https://unpkg.com/vue-fusioncharts/dist/vue-fusioncharts.min.js"
        // "https://static.fusioncharts.com/code/latest/maps/fusioncharts.illinois.js"
      ],
      postscripts: [],
      title: "Adult Redeploy Illinois Map Demo",
      buildInfo: [
        {
          Build:
            moment()
              .tz("America/Chicago")
              .format("dddd, MMMM Do YYYY, h:mm:ss a") + "\n",
          // npm i moment-timezone --save-dev
          // let moment = require('moment-timezone')
          GitHub: "https://github.com/ICJIA/icjia-ari-map-demo" + "\n",
          Contact: "cja.irc@illinois.gov" + "\n"
        }
      ],
      window: {
        env: {}
      }

      // And any other config options from html-webpack-plugin:
      // https://github.com/ampedandwired/html-webpack-plugin#configuration
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "./vue/img"),
        to: "img",
        ignore: [".*"]
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "./static"),
        to: "static",
        ignore: [".*"]
      }
    ]),
    new ExtractTextPlugin({
      filename: "css/webpack.css",
      allChunks: true
    })
  ],
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
      vendor: path.resolve(__dirname, "./vue/vendor/"),
      img: path.resolve(__dirname, "./vue/img/")
    },
    extensions: ["*", ".js", ".vue", ".json"]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: "#eval-source-map"
};

if (process.env.NODE_ENV === "production") {
  module.exports.devtool = "#source-map";
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),
    new CleanWebpackPlugin(path.resolve(__dirname, "./dist")),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
          // drop_console: true
        }
      },
      sourceMap: true,
      parallel: true
    }),
    new webpack.BannerPlugin({
      banner: banner + "\nname:[name]\nfilebase:[filebase]\nfile:[file]",
      entryOnly: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}

if (process.env.REPORT_ENV === "report") {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new BundleAnalyzerPlugin()
  ]);
}
