module.exports = {
    plugins: [
        new webpack.DefinePlugin({
          'process.env.REACT_APP_CLIENT_ID': JSON.stringify(process.env.REACT_APP_CLIENT_ID),
        })
    ],
    }