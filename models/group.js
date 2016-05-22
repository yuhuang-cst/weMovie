var mongodb = require("./db");

function Group(gid, hostname, friendsname, mid) {
	this.gid = gid;
	this.host = hostname;
	this.friends = friendsname; // list
	this.mid = mid;
};

module.exports = Group;

Group.prototype.save = function save(callback){
	console.log(this);
	var group = this;
	mongodb.open(function(err,db) {
		if (err) { return callback(err); }
		db.collection('groups', function(err,collection) {
			var query = {};
			query.gid = group.gid;
			console.log('Try to find one with the same gid ' + this.gid );
			collection.ensureIndex('gid',{unique:true},function(err) {
				console.log('Ensure Index');
				collection.findOne(query, function(err,doc) {
					console.log('try to find onr');
					if (err) { return callback(err); }
					if (doc) {
						console.log('find' + doc);
						console.log(doc);
						console.log(group);
						doc.host = group.host;
						doc.friends = group.friends;
						doc.mid = group.mid;
						collection.save(doc);
						console.log('change to ' + doc);
						console.log(doc);	
						mongodb.close();
						callback(err,doc);
					}
					else {
						console.log('not found, return ' + group);
						collection.insert(group,{safe:true},function(err,group) {
							mongodb.close();
							console.log(group);
							console.log('Add succ' + err);
							callback(err,group);
						});
					}
				});
			});
		});
	});
}

Group.get = function get(gid,callback){
	mongodb.open(function(err,db) {
		if (err) { return callback(err); }
		db.collection('groups', function(err,collection) {
			if(err) { console.log('err?'); mongodb.close(); return callback(err, null); }
			collection.findOne({gid:gid},function(err,doc){
				mongodb.close();
				console.log(doc);
				if (err) { return callback(err); }
				if (doc) { callback(err,doc); }
				else callback(err,null);
			});
		});
	});
};

Group.findAll = function findAll(gids,callback){
	mongodb.open(function(err,db){
		if(err) { return callback(err, null); }
		//读取groups集合
		db.collection('groups',function(err,collection){
			if(err) { mongodb.close(); return callback(err, null); }
			console.log('check in ' + gids);
			collection.find({gid:{$in: gids}}).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				console.log(docs);
				if (err) { return callback(err); }
				if (docs && docs.length) {
					mongodb.close();
					callback(err,docs);
				}
				else return callback(err,null);
			});
		});
	});
};

