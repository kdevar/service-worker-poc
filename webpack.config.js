var path = require('path');
var outputFolder = "dist";

if(process.env.NODE_ENV === "local"){
    outputFolder = "../";
}


module.exports = {
  devtool: 'source-map',
  entry: './src/sw.js',
  output: {
    path: path.resolve(__dirname, outputFolder),
    filename: 'detail-service-worker.js'
  }
};