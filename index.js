var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongodb = require("mongodb");
var mongoose = require("mongoose");
var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI;

var server = new mongodb.Server("127.0.0.1", 27017, {});
var client = new mongodb.Db('test', server);

mongoose.connect(connectionString);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("acceptable");
});

var kittySchema = mongoose.Schema({
    name: String,
    message: String
})

kittySchema.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name"
  console.log(greeting);
}

var Kitten = mongoose.model('Kitten', kittySchema)


var silence = new Kitten({ name: 'Silence' })
console.log(silence.name) // 'Silence'


var fluffy = new Kitten({ name: 'fluffy' });
fluffy.speak() // "Meow name is fluffy"

// fluffy.save(function (err, fluffy) {
//   if (err) return console.error(err);
//   fluffy.speak();
// });


  var getData = function(){
    var result = [];

  Kitten.find(function (err, kittens) {
    if (err) return console.error(err);
    var results = [];
    for(var i=0; i< kittens.length;i++)
    {
      results[i] = JSON.stringify(kittens[i].message);
    }
    io.emit('chat message', results);
});

  return result;};

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){

    getData();

  	socket.on('chat message', function(msg){
    var messageDoc = new Kitten({ name: 'anonymous', message: msg})
    messageDoc.save(function (err, message) {
    if (err) return console.error(err);
    message.speak();
  });

    io.emit('chat message', msg);

  });
});

var PORT =  process.env.PORT ||3000;
http.listen(PORT, function(){
  console.log('listening on *:3000');
});