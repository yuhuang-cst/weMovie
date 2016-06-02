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

function findAll(userName, callback){
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

function getStatus(status){
  switch(status){
  case '10':
    return '已发布';
  case '20':
    return '转码失败';
  case '21':
    return '审核失败';
  case '22':
    return '片源错误';
  case '23':
    return '发布失败';
  case '24':
    return '上传失败';
  case '30':
    return '处理中';
  case '31':
    return '审核中';
  case '32':
    return '无视频源';
  case '33':
    return '上传初始化';
  case '34':
    return '视频上传中';
  case '40':
    return '停用';
  default:
    return '未知状态';
  }
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


module.exports.findAll = findAll;
module.exports.insert = insert;
module.exports.remove = remove;
module.exports.getStatus = getStatus;





