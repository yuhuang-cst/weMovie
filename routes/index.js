var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Group = require('../models/group.js');
var UserAct = require('../models/useract.js');

var events = require("events");

router.get('/',function(req, res) {
  res.render('index',{
    title: '首页',
    groups: []
  });
  /*Post.get(null,function(err, posts){
  	if(err){
  		posts = [];
  	}
  	res.render('index',{
  		title:'首页',
  		posts:posts
  	});
  });*/
});

router.get("/u/:user",function(req,res){
	User.get(req.params.user,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/');
		}
		if (req.session.groups) {
			console.log('groups in session');
			console.log(req.session.groups);

			return res.render('user',{
				title: user.name,
				groups: req.session.groups
			});
		}		

		UserAct.get(user.name,function(err,useract){
			console.log("Show useract");
			console.log(useract);
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			console.log("Show groups");

			var groups = [];
			var proc = 0;

			Group.findAll(useract.groupsid, function(err,groups) {
				if (!groups) groups = [];
				req.session.groups = groups;
				res.render('user',{
					title:user.name,
					groups:groups
				});
			});
			/*var getAllGroupsEvent = new events.EventEmitter();
			getAllGroupsEvent.setMaxListeners(30);
			for (var i = 0; i < useract.groupsid.length; i++) {
				Group.get(useract.groupsid[i], function(err, group) {
					if (group != null) {
						groups.push(group);
						console.log(group);
					}
					proc ++;
					console.log('one group ' + proc + ' find');
					console.log(group);
					if (proc == useract.groupsid.length) {
						getAllGroupsEvent.emit(user.name + 'getallgroups');
					}
				});
			}
			
			getAllGroupsEvent.on(user.name + 'getallgroups', function() {
				console.log('show ENd');
				getAllGroupsEvent.removeAllListeners();
				req.session.groups = groups;
				res.render('user',{
					title:user.name,
					groups:groups
				});
			});*/

		});
	});
});

router.get('/g/:gid',checkLogin);
router.get("/g/:gid",function(req,res){
	Group.get(Number(req.params.gid), function(err, group) {
		console.log('Group' + req.params.gid + group);
		if(!group) {
			req.flash('error','Group not exist.');
			return res.redirect('/');
		}

		var user = req.session.user;
		UserAct.get(user.name,function(err,useract) {
			console.log("Show useract");
			console.log(useract);
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}

			if (!(req.params.gid in useract.groupsid)) {
				req.flash('error', 'Not permitted');
				return res.redirect('/');
			}

			/*res.render('user', {
				title:req.params.gid,
				groups: []
			});*/
			res.render('group');
		});
	});
});

router.get('/friends',checkLogin);
router.get('/friends',function(req,res) {
	res.render('user', {
		title:req.params.user,
		groups: []
	});
});

router.post('/post',checkLogin);
router.post("/post",function(req,res){
	console.log('I am in');
	var currentUser = req.session.user;
	var gid = global.groupid; global.groupid = global.groupid + 1;
	var group = new Group(gid, currentUser.name, {}, req.body.mid/*, req.body.movie*/);
	console.log(group);

	req.session.groups = null;
	console.log('i am mid');
	UserAct.add(currentUser.name, gid, function(err,usersact) {
		console.log('line135');
		if(err) {
			console.log('err in UserAct.add');
			req.flash('error',err);
			return res.redirect('/');
		}
		group.save(function(err) {
			console.log('line142');
			if(err) {
				console.log('err in group.save');
				req.flash('error',err);
				return res.redirect('/');
			}

			req.flash('success','新建group: ' + group.gid);
			res.redirect('/u/'+currentUser.name);
		});
	});
	

});

router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
	res.render('reg',{
		title:"用户注册"
	});
});

router.post('/reg',checkNotLogin);
router.post("/reg",function(req,res){
	console.log(req.body);
	//检验用户两次输入口令是否一致
	if(req.body['password-repeat']!=req.body['password']){
		req.flash('error','两次输入的口令不一致');
		return res.redirect('/reg');
	}

	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password: password
	});

	var useract = new UserAct({
		name: newUser.name,
		groupsid: []
	});

	//检查用户名是否已经存在
	User.get(newUser.name,function(err,user){
		if(user){
			err = 'Username already exists.';
		}
		if(err){
			req.flash('error',err);
			console.log("err");
			return res.redirect('/reg');
		}
		console.log("save");
		//如果不存在则新增用户
		newUser.save(function(err){
			if(err){
				req.flash('error',err);
				console.log("save err");
				console.log(err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			useract.save(function(err){
				if(err){
					req.flash('error',err);
					console.log("save useract err");
					console.log(err);
					return res.redirect('/reg');
				}
			});
			req.flash('success','注册成功');
			return res.redirect('/');
		});
		
	});
});

router.get('/login',checkNotLogin);
router.get("/login",function(req,res){
	res.render('login',{
		title:'用户登入'
	});
});

router.post('/login',checkNotLogin);
router.post("/login",function(req,res){
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.register-password).digest('base64');

	User.get(req.body.register-email,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/login');
		}
		if(user.password!=password){
			req.flash('error','用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success','登入成功');
		res.redirect('/');
	});
});

router.get("/logout",checkLogin);
router.get("/logout",function(req,res){
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/');
});

function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash('error',"未登入");
		return res.redirect('/login');
	}
	req.session.groups = null;
	next();
};

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash("error","已登入");
		return res.redirect('/');
	}
	next();
};

module.exports = router;
