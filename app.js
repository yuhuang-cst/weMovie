var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var settings = require('./settings.js');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var routes = require('./routes/index');
var users = require('./routes/users');

//var io = require('socket.io').listen(8080);

var app = express();

global.groupid = 0;
//emitter.setMaxListeners(100);

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

app.use(flash());
app.use(session({
	secret: settings.cookieSecret,
	resave: false,
  saveUninitialized: true,
	store: new MongoStore({
		db: settings.db
	})
}));

//视图助手 不同登录状态下页面呈现不同内容
app.use(function(req,res,next){
    console.log("app.usr local");
    res.locals.user = req.session.user;
    res.locals.post = req.session.post;
    var error = req.flash('error');
    res.locals.error = error.length?error:null;

    var success = req.flash('success');
    res.locals.success = success.length?success:null;

    next();
});

app.use('/', routes);
app.use('/users', users);

//app.get('/', routes.index);
//app.get('/u/:user', routes.user);
//app.post('/post', routes.post);
//app.get('/reg', routes.reg);
//app.post('/reg', routes.doReg);
//app.get('/login', routes.login);
//app.post('/login', routes.doLogin);
//app.get('/logout', routes.logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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




//handle the socket
/*io.sockets.on('connection', function(socket) {
	//new user login
	socket.on('login', function(nickname) {
		if (users.indexOf(nickname) > -1) {
			socket.emit('nickExisted');
		}
		else {
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login');
		};
	});
  
	//user leaves
	socket.on('disconnect', function() {
		users.splice(socket.userIndex, 1);
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});
  
	//new message get
	socket.on('postMsg', function(msg, color) {
		socket.broadcast.emit('newMsg', socket.nickname, msg, color);
	});
  
	//new image get
	socket.on('img', function(imgData, color) {
		socket.broadcast.emit('newImg', socket.nickname, imgData, color);
	});
});*/

module.exports = app;
