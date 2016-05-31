var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
//var Post = require('../models/post.js');
//var Group = require('../models/group.js');
var UserAct = require('../models/useract.js');
var Friends = require('../models/friends.js');

var events = require("events");
var letvSdk = require('../models/letvServerAPI.js');
var Mission = require('../models/mission.js');
var Error = require('../models/error.js');
var Contant = require('../models/constant.js')

global.mission_info = {};

function reset(req) {
	req.session.missions = null;
	req.session.invited = null;
	req.session.friends = null;
}

router.get('/',function(req, res) {
  res.render('index',{
    title: '首页',
    missions: []
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
	reset(req);
	User.get(req.params.user,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/');
		}
		if (req.session.missions && req.session.friends) {
			console.log('missions in session');
			console.log(req.session.missions);

			console.log('missions in friends');
			console.log(req.session.friends);
			
			return res.render('user',{
				title: user.name,
				missions: req.session.missions,
				invited: req.session.missions,
				friends: req.session.friends
			});
		}		

		UserAct.get(user.name,function(err,useract){
			console.log("Show useract");
			console.log(useract);
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			console.log("Show missions");

			//var missions = [];
			//var proc = 0;// TODO:???

			Mission.findAll(useract.groupsid, function(err,missions) {
				if (!missions) missions = [];
				req.session.missions = missions;

				Friends.get(user.name, function(err, friends) {
					console.log(friends);
					if (err) {
						req.flash('error', 'In Friends.get: ' + err);
						return res.redirect('/');
					}
					req.session.invited = friends.invited;
					req.session.friends = friends.friends;
					res.render('user',{
						title: user.name,
						missions: missions,
						invited: friends.invited,
						friends: friends.friends
					});
				});
			});
		});
	});
});

router.get('/m/:mid',checkLogin);
router.get("/m/:mid",function(req,res) {
	var user = req.session.user;
	UserAct.get(user.name,function(err,useract) {
		console.log("Show useract");
		console.log(useract);
		if (err) {
			req.flash('error',err);
			return res.redirect('/');
		}

		var count = 0;
		for (var i = 0; i < useract.groupsid.length; i++) {
			if (useract.groupsid[i] == req.params.mid) { //TODO I do not know why object == string
				count ++;
				Mission.get(useract.groupsid[i], function(err, mission) {
					console.log('Mission' + req.params.mid + mission);
					if (!mission) {
						req.flash('error','mission not exist.');
						return res.redirect('/');
					}

					if (!global.mission_info[req.params.mid]) { global.mission_info[req.params.mid] = []; }
					return res.render('letv', {
						username: user.name,
						members: global.mission_info[req.params.mid],
						title: '云中歌',
  					vu: '86e12dca1b',
  					beginTime: new Date('2016-05-31 20:13:00'),
  					endTime: new Date('2016-05-31 20:53:00')
					});
				});
			}
		}
		if (!count) {
			req.flash('error', 'Not permitted');
			return res.redirect('/');
		}
	});
});

router.get('/friends',checkLogin);
router.get('/friends',function(req,res) {
	res.render('user', {
		title:req.params.user,
		groups: []
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

	var friends = new Friends({
		name: newUser.name,
		friends: [],
		invited: []
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
				}	
				friends.save(function(err,doc) {
					console.log('注册成功');
					console.log(doc);
					if (err) {
						req.flash('error',err);
						console.log("save friends-list err");
					}
					req.flash('success','注册成功');
					return res.redirect('/');
				});
			});
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
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username,function(err,user){
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

// 好友邀请
router.post('/invite', checkLogin);
router.post('/invite', function(req, res) {
	var user = req.session.user;
	User.get(req.body.inviteByName, function(err, invitedUser) {
		if (err) {
			req.flash('error',err);
			return res.redirect('/u/' + user.name);
		}
		if (!invitedUser) {
			req.flash('error', 'user \"' + req.body.inviteByName + ' \" not exist');
			return res.redirect('/u/' + user.name);
		}

		Friends.invite(user.name, req.body.inviteByName, function(err, doc) {
			if (err) {
				console.log('err in Friends.invite');
				req.flash('error',err);
			}
			else {
				reset(req);
				req.flash('success', '好友邀请已发送');
			}
			return res.redirect('/u/' + user.name);
		});
	});
});

router.get('/accept/:src', checkLogin);
router.get('/accept/:src', function(req, res) {
	var user = req.session.user;
	User.get(req.params.src, function(err, src_user) {
		if (err) {
			req.flash('error',err);
			return res.redirect('/u/' + user.name);
		}
		if (!src_user) {
			req.flash('error', 'user \"' + req.params.src + ' \" not exist');
			return res.redirect('/u/' + user.name);
		}

		Friends.accept(req.params.src, user.name, function(err, doc) {
			if (err) {
				console.log('err in Friends.accept' + err);
				req.flash('error',err);
			}
			else {
				reset(req);
				req.flash('success', '已接受来自 ' + req.params.src + ' 的好友邀请');
			}
			return res.redirect('/u/' + user.name);
		});
	});
});

router.get('/reject/:src', checkLogin);
router.get('/reject/:src', function(req, res) {
	var user = req.session.user;
	User.get(req.params.src, function(err, src_user) {
		if (err) {
			req.flash('error',err);
			return res.redirect('/u/' + user.name);
		}
		if (!src_user) {
			req.flash('error', 'user \"' + req.params.src + ' \" not exist');
			return res.redirect('/u/' + user.name);
		}

		Friends.reject(req.params.src, user.name, function(err, doc) {
			if (err) {
				console.log('err in Friends.reject');
				req.flash('error',err);
			}
			else {
				reset(req);
				req.flash('success', '已拒绝来自 ' + req.params.src + ' 的好友邀请');
			}
			return res.redirect('/u/' + user.name);
		});
	});
});

function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash('error',"未登入");
		reset(req);
		return res.redirect('/login');
	}
	next();
};

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash("error","已登入");
		return res.redirect('/');
	}
	next();
};


//hy

/*
* 搜索影片
* videoName (string): 视频名称
* index (int): 页索引
*/
router.get('/search', function(req, res, next){
  var index = parseInt(req.query.index) || 1;
  var videoName = req.query.videoName || '';
  letvSdk.videoList(videoName, index, Contant.RECORD_NUM, function(data){
  	var data = JSON.parse(data.toString());
  	var maxIndex = Math.ceil(data['total'] / Contant.RECORD_NUM);//取上整
  	res.render('searchResult', {
  	  records : data['data'],
  	  prePage : '/search?videoName=' + videoName + '&index=' + (index <= 1 ? 1 : index - 1) ,
  	  nextPage : '/search?videoName=' + videoName + '&index=' + (index >= maxIndex ? maxIndex : index + 1)
  	});
  });
});


//创建观影任务
router.get('/createMission', function(req, res, next){
	res.render('missionTest');
})

router.post('/createMission', checkLogin);
router.post('/createMission', function(req, res, next){
	var currentUser = req.session.user;
	Mission.create(Mission.postReqToMission(currentUser, req), function(err, mid){
		if (err){
  	  res.send(JSON.stringify({code : Error.DB_ERROR, message : Error.DB_ERROR_MESSAGE}));
  	}
		// 将任务mid加入个人信息
		console.log('mid='+mid);
		UserAct.add(currentUser.name, mid, function(err,usersact) {
			if(err) {
				console.log('err in UserAct.add');
				req.flash('error',err);
				return res.redirect('/');
			}
			req.flash('success', JSON.stringify({code : 0, message : 'success', data : {mid : mid}}));
			return res.redirect('/u/'+currentUser.name);
		});
  });
});

//更新任务
router.post('/updateMission/:mid', function(req, res, next){
  console.log(req.body);
	console.log(req.params.mid);
	var currentUser = req.session.user;
	Mission.update(req.params.mid, Mission.postReqToMission(req.session.user, req), function(err, mission) {
  	if (err || !mission) {
			console.log('err in mission.update');
			req.flash('error', err);
			req.session.missions = null;
			req.session.friends = null;
			return res.redirect('/')
		}
  	req.session.missions = null;
		req.session.friends = null;
		return res.redirect('/u/'+currentUser.name);
  });
});

//删除任务
router.get('/removeMission/:mid', function(req, res, next){
	console.log(req.params.mid);
	var user = req.session.user;
	UserAct.get(user.name,function(err,useract) {
		console.log("Show useract");
		console.log(useract);
		if (err) {
			req.flash('error',err);
			return res.redirect('/');
		}

		var count = 0;
		for (var i = 0; i < useract.groupsid.length; i++) {
			if (useract.groupsid[i] == req.params.mid) { //TODO I do not know why object == string
				count ++;
				Mission.remove(useract.groupsid[i], function(err) {
					if (err) {
						console.log('err in Mission.remove');
						req.flash('error', err);
						req.session.missions = null;
						req.session.friends = null;
						return res.redirect('/')
					}
  				UserAct.del(user.name, useract.groupsid[i], function(err,usersact) {
						if (err || !usersact) {
							console.log('err in UserAct.del');
							req.flash('error',err);
							return res.redirect('/');
						}
						req.session.missions = null;
						req.session.friends = null;
						return res.redirect('/u/'+user.name);
					});
				});
			}
		}
		if (!count) {
			req.flash('error', 'Not permitted');
			return res.redirect('/');
		}
	});
});

//初始化上传视频
router.post('/html5UploadInit', function(req, res, next){
  console.log('req.query', req.query);

  if (req.query.token){//断点续传
  	letvSdk.uploadResume(req.query.token, parseInt(req.query.uploadtype), function(data){
  	  data = JSON.parse(data.toString());
      res.send(data);
    });
  }else{//从头开始传输
    letvSdk.uploadInit(req.query.video_name, parseInt(req.query.file_size), parseInt(req.query.uploadtype), function(data){
      data = JSON.parse(data.toString());
      res.send(data);
    });
  }
});


//上传视频
router.get('/upload', function(req, res, next){
	res.redirect('/html/html5Upload.html');
})

//更新视频信息
router.get('/updateVideoInfo', function(req, res, next){
  letvSdk.videoUpdate(req.query.videoID, req.query.videoName, req.query.videoDesc, req.query.tag, function(data){
    var data = JSON.parse(data.toString());
    console.log(data);
  });
});


module.exports = router;

