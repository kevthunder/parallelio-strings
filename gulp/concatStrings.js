var through = require('through2');
var File = require('vinyl');
var path = require('path');
var fs = require('fs');

var concatStrings = function(fileName, options) {
  var opt = Object.assign({},concatStrings.defaultOpt, options)
  var stream = through.obj(function(file, enc, cb) {
      this.push(file);
      cb();
  }, function(cb) {
      var stream = this;
      concatStrings.getFileContent(opt, function(fileContent) {
        var fileListFile = new File({
            path: fileName,
            contents: new Buffer(fileContent)
        });
        stream.push(fileListFile);
        cb();
      });
  });
  stream.end();
  return stream;
}

concatStrings.getFileContent = function(options, cb) {
  var folder = path.dirname(require.resolve('parallelio-strings/package.json'))+'/strings';
  var strings = {};
  fs.readdir(folder, (err, files) => {
    files.forEach(file => {
      var basename = path.basename(file, '.json');
      strings[basename] = require('parallelio-strings/strings/'+file);
    });
    var res = concatStrings.formats[options['format']];
    res = res.replace('%%varName%%',options['varName'])
    res = res.replace('%%json%%',JSON.stringify(strings))
    cb(res)
  });
}

concatStrings.formats = {
  'js':     '%%varName%% = %%json%%;',
  'coffee': '%%varName%% = %%json%%'
};

concatStrings.defaultOpt = {
  'varName': 'Parallelio.strings',
  'format':  'coffee'
};

module.exports = concatStrings;