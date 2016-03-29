

var rd = require('rd');
var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var ejs = require('ejs');

module.exports = function(dir, options) {
var utility = require('./utility.js');
  dir = dir || '.'; // 源目录
  var output = options.output || dir; // 输出目录
  console.log(dir, output);
  
  /**
   * 输出静态目录：
   * 遍历_post中的.md文件,解析内容，渲染模版，输出到指定的目录下相同结构的文件夹下
   * 得到list数据，渲染模版，输出到指定的目录下相同结构的文件夹下  
   */
  
  
  var sourceDir = path.resolve(dir, '_post');
  
  var files = rd.readFilterSync(sourceDir, /\.md$/);
  
  async.parallel([
    function(callback) {
      async.map(files, fs.readFile, function (err, results) {
        callback(err,results);
      });
    },
    function(callback) {
      fs.readFile(path.resolve(dir, '_layout','post.layout.html'), function (err, data) {
        callback(err,data);
      });
    },
    function(callback) {
      fs.readFile(path.resolve(dir, '_layout', 'list.layout.html'), function(err, data) {
        callback(err, data);
      });
    }
  ],function (err, results) {
    var postArr = results[0];//文章数据
    var layout = results[1].toString();//文章模板
    var layoutList = results[2].toString();//列表模板
    
    postArr = postArr.map(function (val) {
      return utility.parseContent(val.toString());//文章对象数组
    });
    
    var listObj =[];
    
    for(var i = 0; i < files.length; i++) {
          var post = postArr[i];
          var obj = {};
          obj.title = post.title;
          obj.date = post.date;
          var url = '/public/post' + utility.stripExtName(files[i].slice(sourceDir.length)).replace(/\\/g, '/') + '.html';
          obj.url = url;
          listObj.push(obj);
    }
    
    fs.outputFile(path.resolve(output, 'public', 'index.html'),ejs.render(layoutList, {list: listObj}), function (err) {
      console.log(err);
    });
    
    var htmlArr = postArr.map(function (val) {
      return ejs.render(layout, val);
    });
    
    for(var i = 0; i < htmlArr.length; i++) {
      var file = utility.stripExtName(files[i]);
      file = file.slice(sourceDir.length + 1);
      
      fs.outputFile(path.resolve(output,'public' ,'post', file + '.html'), htmlArr[i], function (err) {
        console.log(err);         
      });
    }
    
  });
  
};


