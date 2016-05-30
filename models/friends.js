var mongodb = require('./db');

function Friends(info){
	this.name = info.name;
	this.friends = info.friends;
};

module.exports = Friends;

Friends.prototype.save = function save(callback){
	//存入mongodb的文档
	console.log(this);
	var friends = {
		name:this.name,
		friends:this.friends
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

Friends.add = function add(username, friendname, callback) {
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取Friends集合
		db.collection('friends',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找name属性为username的文档
			collection.findOne({name:username},function(err,doc) {
				if(err){
					mongodb.close();
					console.log('friends list not found');
					return callback(err, null);
				}
				if (doc) {
					console.log('Show friends');
					console.log(doc.friends);
					//封装文档为User对象
					if (!(friendname in doc.friends)) {
						doc.friends.push(friendname);
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

