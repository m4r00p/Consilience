// Load needed modules
var express = require('express');
var person = require('./person');
var config = require('./config');

// Returns first item from an Array
Array.prototype.first = function () {
  return this[0];
};

var app = express();
// Enable statics
app.use(express.static(__dirname + '/../frontend/'));
app.use(express.bodyParser());
app.use(function (req, res, next) {
  if (!req.body) {
    // Concatenates input in the case of xml stream.
    req.rawBody = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) { console.log('data'); req.rawBody += chunk; });
    req.on('end', function () { console.log('end'); next(); });
  } else {
    // JSON passed so just procceed not additional work is needed.
    next();
  }
});


// Root path should redirect to index.html
app.get('/', function(req, res){
  res.redirect('index.html');
});

// Person
app.get('/person', person.list);
app.post('/person', person.create);
app.get('/person/:id.:format', person.read);
app.put('/person/:id', person.update);
app.del('/person/:id', person.delete);

//More resources here...

app.listen(config.SERVER_PORT);
console.log('Server is running on port: ' + config.SERVER_PORT);
