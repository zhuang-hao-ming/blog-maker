var express = require('express');
var path = require('path');
var fs = require('fs');
var md = require('markdown-it')();
var ejs = require('ejs');
var rd = require('rd');
var async = require('async');
var utility = require('./utility');
/**
 * 预览
 * 读取目录下的_post文件夹内部的.md文件
 * 解析元数据和内容
 * markdown格式的内容解析为html
 * 渲染模板
 */
module.exports = function(dir) {

  dir = '.' || dir;
  var app = express();
  app.use('/public', express.static(path.resolve(dir, 'public')));
  var router = express.Router();

  router.get('/', function(req, res, next) {
    

    //遍历 _post文件夹下的所有.md文件
    //读取文件中的title,构造url，存入数组中
    //渲染文章列表
    var list = [];
    var sourceDir = path.resolve(dir, '_post');

    var files = rd.readFilterSync(sourceDir, /\.md$/); //同步递归列出目录下所有.md文件
    async.parallel(
      [
        function(callback) {
          async.map(files, fs.readFile, function(err, results) {
            callback(err, results);//得到文件内容数组
          });
        },
        function(callback) {
          fs.readFile(path.resolve(dir, '_layout', 'list.layout.html'), function(err, data) {
            callback(err, data);//得到模板数据
          });
        }
      ],
      function(err, results) {
        var list = results[0];
        var listObj = [];
        for(var i = 0; i < list.length; i++) {
          var post = utility.parseContent(list[i].toString());
          var obj = {};
          obj.title = post.title;
          obj.date = post.date;
          var url = '/post' + utility.stripExtName(files[i].slice(sourceDir.length)).replace('\\', '/') + '.html';
          obj.url = url;
          listObj.push(obj);
        }              
        var layout = results[1].toString();
        res.status(200).send(ejs.render(layout,{"list": listObj}));
      });
  });

  router.get('/post/*', function(req, res, next) {
    var postPath = req.params[0]; // return /2016-03/hello-world.html
    postPath = utility.stripExtName(postPath); //去掉扩展名 /2016-03/hello-world  
      
    async.waterfall([
      function(callback) {
        fs.readFile(path.resolve(dir, '_post', postPath + '.md'), function (err, data) {
          var post = utility.parseContent(data.toString()); //读取数据并将解析后的结果传给下一个函数
          callback(err, post);
        });
      },
      function (post, callback) {
          fs.readFile(path.resolve(dir, '_layout', post.layout || 'post.layout.html'), function(err, data) {
          var view = data.toString();//读取模板
          var html = ejs.render(view, post);//渲染数据
          res.send(200, html);//输出结果
        });
      }
    ], function(err, result) {
      
    });
  });

  app.use(router);


  app.listen(3001, function() {
    console.log('listen at 3001');
  });



};


