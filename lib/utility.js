
var md = require('markdown-it')();
var path = require('path');
/**
 * 解析数据
 */
function parseContent(content) {

  var split = '---';
  var post = {};
  var i = content.indexOf(split);
  if (i !== -1) {
    var j = content.indexOf(split, i + split.length);
    if (j !== -1) {
      //存在元数据
      var metaContent = content.slice(i + split.length, j).trim();
      var lines = metaContent.split('\n');
      for (var k = 0; k < lines.length; k++) {
        var line = lines[k].trim();
        var arr = line.split(':');
        if (arr[0] && arr[1]) {
          post[arr[0].trim()] = arr[1].trim();
        }
      }
      content = content.slice(j + split.length);//取出文章内容

    }

  }
  post.content = md.render(content); //传入文章内容

  return post;

}

/**
 * 去掉文件的扩展名
 */
function stripExtName(pathname) {
  var ext = path.extname(pathname);
  var i = pathname.indexOf(ext);
  if (i == -1) {
    i = pathname.length;
  }
  return pathname.slice(0, i);
}


exports.parseContent = parseContent;
exports.stripExtName = stripExtName;