#!/usr/bin/env node



var program = require('commander');


program
  .version('0.0.1');
  
program
  .command('preview [dir]')
  .description('预览dir目录')
  .action(require('../lib/preview.js'));
  
program
  .command('build [dir]')
  .description('构建静态目录')
  .option('-o, --output [output]', '输出目录')
  .action(require('../lib/build.js'));
  
  
  
  
  
program.parse(process.argv);