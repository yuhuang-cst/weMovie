var mongodb = require('./db');

function UserAct(user){
	this.name = user.name;
	this.groupsid = user.groupsid;
};

module.exports = UserAct;

UserAct.prototype.save = function save(callback){
	//存入mongodb的文档
	var useract = {
		name:this.name,
		groupsid:this.groupsid
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		//读取users集合
		db.collection('usersact',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为name属性添加索引，新版本的ensureIndex方法需要一个回调函数
			collection.ensureIndex('name',{unique:true},function(err){
				//写入user文档
				collection.insert(useract,{safe:true},function(err,useract){
					mongodb.close();
					callback(err,useract);
				});
			});
			
		});
	});
};

UserAct.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取useract集合
		db.collection('usersact',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username},function(err,doc){
				mongodb.close();
				if(doc){
					//封装文档为User对象
					var usersact = new UserAct(doc);
					callback(err,usersact);
				}
				else{
					callback(err,null);
				}
			});
		});
	});
};

UserAct.add = function add(username, actid, callback) {
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取useract集合
		db.collection('usersact',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username},function(err,doc){
				if(doc){
					var flag = false;
					for (var i = 0; i < doc.groupsid.length; i++) {
    				if (doc.groupsid[i] == actid) {
							mongodb.close();
    				  return callback('已在邀请列表中',doc);
    				}
  				}
					console.log(doc);
					doc.groupsid.push(actid);
					console.log(doc);
					collection.save(doc);
					return callback(err,doc);
				}
				else {
					mongodb.close();
					callback(err,null);
				}
			});
		});
	});

}

/*
Array.prototype.removeByValue = function(val) {
  for(var i=0; i<this.length; i++) {
    if(this[i] == val) {
      this.splice(i, 1);
      break;
    }
  }
}
*/

UserAct.del = function del(username, val, callback) {
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取useract集合
		db.collection('usersact',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username},function(err,doc){
				if(doc){
					//封装文档为User对象
					// doc.groupsid.removeByValue(actid);
					for (var i = 0; i < doc.groupsid.length; i++) {
    				if (doc.groupsid[i].toString() == val.toString()) {
							doc.groupsid.splice(i, 1);
    				  break;
    				}
  				}
					console.log('UserAct changed to');
					console.log(doc);
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

UserAct.addAll = function del(users, val, callback) {
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取useract集合
		db.collection('usersact',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.find({name:{$in: users}}).sort({time:-1}).toArray(function(err,docs) {
				console.log(docs);
				if (!err && docs) {
					//封装文档为User对象
					var flag;
					for (var i = 0; i < docs.length; i++) {
						flag = false;
						for (var j = 0; j < docs[i].groupsid.length; j++) {
    					if (docs[i].groupsid[j].toString() == val.toString()) {
								flag = true;
								break;
							}
    				}
						if (!flag) {
							docs[i].groupsid.push(val);
							collection.save(docs[i]);
						}
  				}
					console.log('UserAct changed to');
					console.log(docs);
					
					mongodb.close();
					callback(err, docs);
				}
				else {
					mongodb.close();
					callback(err, docs);
				}
			});
		});
	});

}

UserAct.delAll = function del(users, val, callback) {
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取useract集合
		db.collection('usersact',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.find({name:{$in: users}}).sort({time:-1}).toArray(function(err,docs) {
				console.log(docs);
				if (!err && docs) {
					//封装文档为User对象
					for (var i = 0; i < docs.length; i++) {
						for (var j = 0; j < docs[i].groupsid.length; j++) {
    					if (docs[i].groupsid[j].toString() == val.toString()) {
								docs[i].groupsid.splice(j, 1);
								collection.save(docs[i]);
    					  break;
							}
    				}
  				}
					console.log('UserAct changed to');
					console.log(docs);
					
					mongodb.close();
					return callback(err, docs);
				}
				else {
					mongodb.close();
					return callback(err, docs);
				}
			});
		});
	});

}
