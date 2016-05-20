var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var connection = require('./db');
var Model = require('./model');
var router = express.Router();
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database'
  }
});

/* PASSPORT */
passport.use(new LocalStrategy(function(username, password, done) {
  knex.select('*').from('user').where({username: username}).then(function(data) {
    // var user = data;
    if(data.length == 0) {
      return done(null, false, {message: 'Invalid username'});
    } else {
      bcrypt.compare(password, data[0].password, function(err, res) {
        if(!res){
          return done(null, false, {message: 'Invalid password'});
        }
        else{
          return done(null, data);
        }
      });
    }
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user[0].username);
});

passport.deserializeUser(function(username, done) {
  knex.select('*').from('user').where({username: username}).then(function(user) {
    done(null, user);
  });
});
/* PASSPORT OVER */

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.render('index-auth', {username: req.user[0].username, toUser: req.params['user']});
  }
  else{
    res.render('index', { title: 'Express'});
  }
});
router.get('/messages/:user', function(req, res, next){
  if(req.isAuthenticated()){
    res.render('private-msg', {username: req.user[0].username})
  }
  else{
    res.render('index')
  }
})

router.post('/signin', function(req, res, next){
  passport.authenticate('local',
    { successRedirect: '/',
    failureRedirect: '/'},
    function(err, data, info) {
    if(err) {
      return res.redirect('/')
    }

    if(!data) {
      return res.redirect('/')
    }
    return req.logIn(data, function(err) {
      if(err) {
        return res.redirect('/');
      } else {
        return res.redirect('/');
      }
    });
  })(req, res, next);
})

router.get('/logout', function(req, res, next) {
  if(!req.isAuthenticated()) {
    notFound404(req, res, next);
  } else {
    req.logout();
    res.redirect('/');
  }
});

router.post('/signup', function(req, res){

  var fname = req.body.fname;
  var lname = req.body.lname;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  var cryptPassword = bcrypt.hash(password, null, null, function(err, hash) {
  	if(err){return console.error(err);}
    else{
      var post = {fname: fname, lname: lname, username: username, email: email, password: hash}
      var query = connection.query('INSERT INTO user SET ?', post, function (err, resutls) {
        if(err) console.log(err);
      });
    }
  });
  res.send('Go back to <a href="/">home</a> page !')
});


module.exports = router;
