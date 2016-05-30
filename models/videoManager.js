var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

var VIDEO_COLL_NAME = 'videos';

function openColl(callback){
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection(VIDEO_COLL_NAME, callback);
  });
}

function insert(userName, videoID, callback){
  openColl(function(err, coll){
    if(err){
        mongodb.close();
        return callback(err);
      }  
      coll.insert({userName: userName, videoID: videoID}, {safe:true}, function(err, ret){
        mongodb.close();
        callback(err, ret);
      });
  });
}

function find(userName, callback){
  openColl(function(err, coll) {
	if(err) { mongodb.close(); return callback(err); }
	coll.find({userName: userName}).toArray(function(err,records) {
	  mongodb.close();
	  callback(err, records); 
	});
  });
}

function remove(userName, videoID, callback){
  openColl(function(err, coll){
    if(err){
      mongodb.close();
      return callback(err);
    }
    coll.remove({userName: userName, videoID: videoID}, function(err, ret){
      mongodb.close();
      callback(err, ret);
    });
  })
}

/*
insert('hy', '2013届1班毕业视频', function(err, ret){
  console.log('err', err);
  console.log('ret', ret);
});

insert('hy', '2013届2班毕业视频', function(err, ret){
  console.log('err', err);
  console.log('ret', ret);
});*/

/*
find('hy', function(err, records){
  console.log('err', err);
  console.log('ret', records);
});*/

/*
remove('hy', '2013届1班毕业视频', function(err, ret){
  console.log('err', err);
  console.log('ret', ret);
});*/



module.exports.insert = insert;
module.exports.remove = remove;





