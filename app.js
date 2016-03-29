var express = require('express');




var app = express();

app.use('/public',express.static('public'));


app.listen(3001, function () {
  console.log('listen at 3000');
});