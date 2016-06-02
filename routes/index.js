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
var Contant = require('../models/constant.js');
var VideoManager = require('../models/videoManager.js');

global.mission_info = {};
global.user_info = [];

function getRetDict(code, message, data){
  var retDict = {code : code, message : message};
  if (data)
  	retDict['data'] = data;
  return retDict;
}

function reset(req) {
	req.session.missions = null;
	req.session.invited = null;
	req.session.friends = null;
}


function getAllVideoInfo(vids, callback){
  records = [];
  for (i in vids){
    letvSdk.videoGet(vids[i], function(data){
      var data = JSON.parse(data.toString());
      //console.log(data);
      data['data']['status'] = VideoManager.getStatus(data['data']['status']);
      records.push(data['data']);
      if (i == vids.length - 1)
        callback(records);
    });
  }
}

// for test of create missions
router.get('/searchTest', function(req, res) {
	var user = req.session.user;
	var friends = req.session.friends;
	console.log(friends);
	console.log(user);
	return res.render('searchTest', {
		user: user,
  	friends: friends
	});
});

router.post('/createMission2', function(req, res) {
	console.log('233---------');
	console.log(req.body);
	//console.log(req.body.startTime.toString());
	//console.log(req.body.members.toString());
	res.send(getRetDict(0, '创建任务成功'));
	//return res.redirect('/');
});
// -------------
router.get('/',function(req, res) {
	console.log(req.user);
	return res.render('login', {req:req.session});
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
			
			VideoManager.findAll(user.name, function(err, vids){
				vids = [30463731];//用于调试
			  	getAllVideoInfo(vids, function(uploadedVideos){
			  		return res.render('user',{
						title: user.name,
						req: req.session,
						uploadedVideos: uploadedVideos
						//invited: req.session.missions, TODO 完善
					});
			  	});
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
					VideoManager.findAll(user.name, function(err, vids){
						vids = [30463731];
					  	getAllVideoInfo(vids, function(uploadedVideos){
					  		return res.render('user',{
								title: user.name,
								req: req.session,
								uploadedVideos: uploadedVideos
								//invited: req.session.missions, TODO 完善
							});
					  	});
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
					
					/*<---hy----->*/
					var beginTime = new Date(Date.now());
  					var endTime = new Date(beginTime);
  					endTime.setMinutes(endTime.getMinutes() + 40);
  					
					return res.render('letv', {
						title: user.name,
						user: user,
						username: user.name,
						members: global.mission_info[req.params.mid],
						title: '云中歌',
  						vu: '86e12dca1b',
  						beginTime: beginTime,
  						endTime: endTime
					});
					/*
					return res.render('letv', {
						username: user.name,
						members: global.mission_info[req.params.mid],
						title: mission['videoName'],
  						vu: mission['vu'],
  						beginTime: mission['beginTime'],
  						endTime: mission['endTime']
					});*/

					/*<---hy----->*/

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
		title: req.session.user,
		user: req.session.user,
		groups: []
	});
});

router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
	res.render('reg',{
		title: "用户注册",
		user: req.session.user
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

router.post('/login',checkNotLogin);
router.post("/login",function(req,res){
	//生成口令的散列值
	console.log('log in succ');
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	console.log('name' + req.body.username);
	User.get(req.body.username,function(err,user){
		console.log(user);
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
	console.log('wqwqwqwq');
	if(req.session.user){
		console.log('233333');
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
	  user: req.session.user,
	  friends: req.session.friends,
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
	console.log('hy::body:', req.body);
	console.log(req.body.members);
	var currentUser = req.session.user;
	inviteds = req.body.members.split(',');
	mission = Mission.postReqToMission(currentUser, inviteds, req);
	// 对被邀请人员的操作
	User.findAll(inviteds, function(err, friends) {
		console.log(friends);
		if (err) {
			res.send(getRetDict(Error.DB_ERROR, Error.DB_ERROR_MESSAGE));
			//req.flash('error',err);
			//return res.redirect('/');
		}

		Mission.create(mission, function(err, mid){
			if (err) {
				res.send(getRetDict(Error.DB_ERROR, Error.DB_ERROR_MESSAGE));
  	 		//req.flash('error',err);
			//return res.redirect('/');
  		}
			// 将任务mid加入个人信息
			console.log('mid='+mid);
			UserAct.add(currentUser.name, mid, function(err,usersact) {
				if (err) {
					console.log('err in UserAct.add');
					res.send(getRetDict(Error.DB_ERROR, Error.DB_ERROR_MESSAGE));
					//req.flash('error',err);
					//return res.redirect('/');
				}
				//req.flash('success', '创建任务成功')
				console.log(friends);

				for (var i = 0; i < friends.length; i++) {
					console.log('Now invite friend' + friends[i].name);
					console.log(usersact.groupsid);
					UserAct.add(friends[i].name, mid, function(err, useract) {
						if (err) {
							console.log('err in friends UserAct.add');
						}
					});	
				}
				res.send(getRetDict(0, '创建任务成功'));
				//return res.redirect('/u/'+currentUser.name);
			});
		});
	});
});

//更新任务
router.post('/updateMission/:mid', function(req, res, next){
	var currentUser = req.session.user;

	Mission.get(req.params.mid, function(err,mission) {
		if (err || !mission) {
			req.flash('error',err);
			return res.redirect('/');
		}
		User.findAll(mission.member, function(err, friends) {
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			}
			for (var i = 0; i < mission.member.length; i++) {
				UserAct.del(mission.member[i], req.params.mid, function(err, useract) {
					if (err) {
						console.log('err in friends UserAct.add');
					}
				});	
			}

			mission = Mission.postReqToMission(req.session.user, req);
			inviteds = req.body.inviteds;
			if (!inviteds) inviteds = [];
			User.findAll(inviteds, function(err, friends) {
				if (err) {
					req.flash('error',err);
					return res.redirect('/');
				}
				mission.member = [];
				for (var i = 0; i < friends.length; i++) {
					mission.member.push(friends[i].name);
				}

				Mission.update(req.params.mid, mission, function(err, mid){
					if (err) {
  	 				req.flash('error',err);
						return res.redirect('/');
  				}
					// 将任务mid加入个人信息
					console.log('mid='+mid);
					UserAct.add(currentUser.name, mid, function(err,usersact) {
						if (err) {
							console.log('err in UserAct.add');
							req.flash('error',err);
							return res.redirect('/');
						}
						req.flash('success', '修改任务成功');

						//TODO 加一个emitter，删除结束后才开始加
						for (var i = 0; i < mission.member.length; i++) {
							UserAct.add(mission.member[i], mid, function(err, useract) {
								if (err) {
									console.log('err in friends UserAct.add');
								}
							});	
						}
	
						return res.redirect('/u/'+currentUser.name);
					});
				});
			});
		});
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
});

router.get('uploaded', function(req, res, next){
  //TODO: 插入userName 与 videoID
});

//更新视频信息
router.get('/updateVideoInfo', function(req, res, next){
  letvSdk.videoUpdate(req.query.videoID, req.query.videoName, req.query.videoDesc, req.query.tag, function(data){
    var data = JSON.parse(data.toString());
    console.log(data);
  });
});


module.exports = router;

