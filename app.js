var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var routes = require('./routes/index');
var users = require('./routes/users');
var connection = require('./routes/db');
var moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'mynameisjeff'}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

server.listen(3000);
users = {};
connections = [];

io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);
  // Disconnect
  socket.on('disconnect', function(data){
    delete users[socket.username];
    //users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnect: %s sockets connected', connections.length);
  });





  socket.on('Send message', function(data, to, callback){
    var msg = data.trim();
    var name = to;
    if(name in users && name != socket.username){
      users[name].emit('whisper', {msg: data, user: socket.username});
      users[socket.username].emit('whisper', {msg: data, user: socket.username});

      date = moment().format('h:mm:ss a');
      post = {from: socket.username, to: to, msg: msg, date: date}
      connection.query('INSERT INTO chatschema SET ?', post, function (err, resutls) {
        if(err) console.log(err);
      });
    }else{
      callback('You cant talk to yourself, go to a mirror and try.')
    }
  });

  // New User
  socket.on('new user', function(data, callback){
    socket.username = data;
    users[socket.username] = socket;
    updateUsernames();
  });


  socket.on('load msg', function(data, fromS){
    console.log("heloooooooo im here 1 to", data)
    console.log("heloooooooo im ", fromS);
    connection.query('select * from chatschema where (`from`="'+fromS+'" AND `to`="'+data+'") OR (`from`="'+data+'" AND `to`="'+fromS+'")', function(err, rows){
      if(err){return console.log(err)}
      else{
        console.log(rows.length);
        socket.emit('get msgs', rows);
      }
    });

  });

  function updateUsernames(){
    io.sockets.emit('get users', Object.keys(users));
  }

});
