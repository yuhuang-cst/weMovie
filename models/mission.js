var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

var MISSION_COLL_NAME = 'missions'

function openColl(callback){
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection(MISSION_COLL_NAME, callback);
  });
}

//提取post请求中的任务信息
function postReqToMission(user, members, req){
  mission = {};
  mission['creator'] = user.name;
  mission['videoName'] = req.body.videoName;
  mission['vu'] = req.body.vu;
  mission['beginTime'] = new Date(req.body.beginTime);
  mission['endTime'] = new Date(req.body.beginTime);
  mission['endTime'].setSeconds(mission['endTime'].getSeconds() + parseInt(req.body.duration));
  //mission['duration'] = parseInt(req.body.duration);
	mission['member'] = {}
	for (var i = 0; i < members.length; i++) {
  	mission.member[members[i]] = "";
	}
  return mission;
}

//插入任务
function create(mission, callback){
  openColl(function(err, coll){
    if(err){
        mongodb.close();
        return callback(err);
      }  
      coll.insert(mission, {safe:true}, function(err, ret){
        mongodb.close();
        callback(err, ret['insertedIds'][0]/*.toString()*/);
      });
  });
}

//获得任务
function get(mid, callback){
  openColl(function(err, coll){
    if(err){
      mongodb.close();
      return callback(err);
    }
    coll.findOne({_id : mid}, function(err, record){
      mongodb.close();
      callback(err, record);
    });
  });
}

//获取所有任务
function findAll(mids,callback) {
	openColl(function(err, coll) {
		if(err) { mongodb.close(); return callback(err); }
		coll.find({_id : {$in: mids}}).sort({time:-1}).toArray(function(err,records) {
			mongodb.close();
			console.log(records);
			callback(err, records); 
		});
	});
}


//删除任务
function remove(mid, callback){
  openColl(function(err, coll){
    if(err){
      mongodb.close();
      return callback(err);
    }
    coll.remove({_id : mid}, function(err){
      mongodb.close();
      callback(err);
    });
  })
}

//更新任务
function update(mid, mission, callback){
  openColl(function(err, coll){
    if(err){
      mongodb.close();
      return callback(err);
    }
    coll.update({_id : ObjectID(mid)}, mission, function(err, ret){
      mongodb.close();
      console.log(ret);
      callback(err, ret);
    })
  });
}


module.exports.postReqToMission = postReqToMission;
module.exports.create = create;
module.exports.get = get;
module.exports.findAll = findAll;
module.exports.remove = remove;
module.exports.update = update;
