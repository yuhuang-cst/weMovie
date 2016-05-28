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
					//封装文档为User对象
					if (!(actid in doc.groupsid)) {
						doc.groupsid.push(actid);
						collection.save(doc);
					}
					
					mongodb.close();
					callback(err,doc);
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
    				if (doc.groupsid[i] == val) {
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
