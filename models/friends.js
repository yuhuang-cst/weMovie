var mongodb = require('./db');

function Friends(info){
	this.name = info.name;
	this.friends = info.friends;
	this.invited = info.invited;
};

module.exports = Friends;

var FRIENDS_COLL_NAME = 'friends'

function openColl(callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection(FRIENDS_COLL_NAME, callback);
  });
}


Friends.prototype.save = function save(callback){
	//存入mongodb的文档
	console.log(this);
	var friends = {
		name:this.name,
		friends:this.friends,
		invited:this.invited
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		//读取users集合
		db.collection('friends',function(err,collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为name属性添加索引，新版本的ensureIndex方法需要一个回调函数
			collection.ensureIndex('name',{unique:true},function(err){
				//写入user文档
				collection.insert(friends, {safe:true}, function(err,doc) {
					mongodb.close();
					callback(err,doc);
				});
			});
			
		});
	});
};

Friends.get = function get(username,callback){
	mongodb.open(function(err,db) {
		if(err){
			return callback(err);
		}
		//读取Friends集合
		db.collection('friends',function(err,collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username},function(err,doc){
				mongodb.close();
				if(doc){
					//封装文档为User对象
					var friends = new Friends(doc);
					callback(err,friends);
				}
				else {
					console.log('friends list not found');
					callback(err,null);
				}
			});
		});
	});
};

Friends.del = function del(username, val, callback) {
	mongodb.open(function(err,db) {
		if(err){
			return callback(err);
		}
		//读取Friends集合
		db.collection('friends', function(err,collection) {
			if(err) {
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username}, function(err,doc) {
				if (doc) {
					//封装文档为User对象
					// doc.groupsid.removeByValue(actid);
					for (var i = 0; i < doc.friends.length; i++) {
    				if (doc.friends[i] == val) {
							this.splice(i, 1);
    				  break;
    				}
  				}
					collection.save(doc);
		
					mongodb.close();
					callback(err,doc);
				}
				else {
					mongodb.close();
					callback(err,doc);
				}
			});
		});
	});
}

Friends.invite = function invite(src, dst, callback) {
	openColl(function(err, coll) {
    if (err) {
      mongodb.close();
      return callback(err);
    }
    coll.findOne({name: src}, function(err, src_user) {
			if (err || !src_user) {
				mongodb.close();
				return callback(err + ': 用户邀请来源错误');
			}
			coll.findOne({name: dst}, function(err, dst_user) {
				console.log('Not exist' + dst);
				if (err || !dst_user) {
					mongodb.close();
					return callback(err + ': 所邀请的用户不存在');
				}
				for (var i = 0; i < dst_user.invited.length; i++) {
					if (src == dst_user.invited[0]) {
						flag = true;
						dst_user.invited.push(src);
						coll.update({name: dst}, dst_user, function(err, doc){
      				mongodb.close();
      				console.log(doc);
      				return callback(err, doc);
    				});
					}
				}	
				if (!flag) {
					mongodb.close();
					return callback(err + ': 好友邀请重复');
				}
			});
    });
  });
}


Friends.accept = function accept(src, dst, callback) {
	openColl(function(err, coll) {
    if (err) {
      mongodb.close();
      return callback(err);
    }
    coll.findOne({name: dst}, function(err, dst_user) {
			if (err || !dst_user) {
				mongodb.close();
				return callback(err + ': 用户邀请去向错误');
			}
			var flag = false;
			for (var i = 0; i < dst_user.invited.length; i++) {
				if (src == dst_user.invited[0]) {
					flag = true;
					coll.findOne({name: src}, function(err, src_user) {
						if (err || !src_user) {
							mongodb.close();
							return callback(err + ': 用户邀请来源不存在');
						}
						src_user.friends.push(dst);
						coll.update({name: src}, src_user, function(err, doc){
      				dst_user.friends.push(src);
							for (var i = 0; i < dst_user.invited.length; i++) {
    						if (dst_user.invited[i] == src) {
									dst_user.invited.splice(i, 1);
    						  break;
    						}
  						}
							coll.update({name: dst}, dst_user, function(err, doc){
      					mongodb.close();
      					console.log(doc);
      					return callback(err, doc);
    					});
    				});
					});
				}
			}
			if (!flag) {
				mongodb.close();
				console.log(typeof(src));
				console.log(typeof(dst_user.invited[0]));
				console.log(src == dst_user.invited[0]);
				return callback(err + ': 错误的函数调用');
			}
    });
  });
}

Friends.reject = function reject(src, dst, callback) {
	openColl(function(err, coll) {
    if (err) {
      mongodb.close();
      return callback(err);
    }
    coll.findOne({name: dst}, function(err, dst_user) {
			if (err || !dst_user) {
				mongodb.close();
				return callback(err + ': 用户邀请去向错误');
			}
			var flag = false;
			for (var i = 0; i < dst_user.invited.length; i++) {
				if (src == dst_user.invited[0]) {
					flag = true;
					coll.findOne({name: dst}, function(err, src_user) {
						if (err || !src_user) {
							mongodb.close();
							return callback(err + ': 用户邀请来源不存在');
						}
						for (var i = 0; i < dst_user.invited.length; i++) {
    					if (dst_user.invited[i] == src) {
								dst_user.invited.splice(i, 1);
    					  break;
    					}
  					}
						coll.update({name: dst}, dst_user, function(err, doc){
      				mongodb.close();
      				console.log(doc);
      				return callback(err, doc);
    				});
					});
				}
			}
			if (!flag) {
				mongodb.close();
				return callback(err + ': 错误的函数调用');
			}
    });
  });
}

