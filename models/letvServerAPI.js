var http = require("http");
var qs = require("querystring");
var crypto = require('crypto');
var Buffer = require("buffer").Buffer

var USER_UNIQUE = 'm9rv3asjdc';
var SECRET_KEY = '4f4783bb2ef51291154f3db3d4f62ce5';

function getKeys(dict){
  keys = [];
  for (var key in dict)
      keys.push(key);
  return keys;
}

function md5 (text) {
  var str = (new Buffer(text)).toString("binary");
  return crypto.createHash('md5').update(str).digest('hex');
};


function generateSign(params, secretKey){
  var keys = getKeys(params).sort();
  var keyStr = '';
  for (var i in keys){
    if (typeof(keys[i]) == 'function')
      continue;
    keyStr += keys[i] + params[keys[i]];
  }
  keyStr += secretKey;
  return md5(keyStr)
}

function generateParams(api, user_unique){
  params = {
    user_unique : user_unique, 
    timestamp : new Date().getTime(),
    api : api,
    format : 'json',
    ver : '2.0',
  };
  return params;
}

function onErr(err){
  console.log('call onErr');
  console.log(err);
}


function doGet(contents, onErr, handleData){
  var options = {
    host : 'api.letvcloud.com',
    path : '/open.php?' + contents,
    method : 'GET',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length' : contents.length
    }
  };  
  var req = http.request(options, function(res){
    console.log('status: ', res.statusCode);
    res.on('error', onErr); 

    var content = ''; 
    res.on('data', function(data){
      content += data;
    });

    res.on('end', function(){
      handleData(content);
    })

  });  
  req.write(contents);
  req.end();
}

function doPost(contents, onErr, handleData){
  var options = {
    host : 'api.letvcloud.com',
    path : '/open.php',
    method : 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length' : contents.length
    }
  };  
  var req = http.request(options, function(res){
    console.log('status: ', res.statusCode);
    res.on('error', onErr); 

    var content = ''; 
    res.on('data', function(data){
      content += data;
    });

    res.on('end', function(){
      handleData(content);
    });

  });
  
  req.write(contents);
  req.end();
}

//上传初始化
function uploadInit(filename, filesize, uploadtype, callback){
  console.log('call uploadInit()');

  var params = generateParams('video.upload.init', USER_UNIQUE);
  params['video_name'] = filename;
  params['file_size'] = filesize;
  //params['client_ip'] = ip;
  params['uploadtype'] = uploadtype;
  params['sign'] = generateSign(params, SECRET_KEY);

  var contents = qs.stringify(params);
  doGet(contents, onErr, callback);
}

//视频断点续传
function uploadResume(token, uploadtype, callback){
  console.log('call uploadResume');

  var params = generateParams('video.upload.resume', USER_UNIQUE);
  params['token'] = token;
  params['uploadtype'] = uploadtype;
  params['sign'] = generateSign(params, SECRET_KEY);

  var contents = qs.stringify(params);
  doGet(contents, onErr, callback);
}

//模糊搜索，获取视频列表
function videoList(videoName, index, size, callback){
  console.log('call videoList');

  var params = generateParams('video.list', USER_UNIQUE);
  console.log(params)
  params['video_name'] = videoName;
  console.log('videoName = ', videoName)
  params['index'] = index;
  params['size'] = size;
  params['sign'] = generateSign(params, SECRET_KEY);

  var contents = qs.stringify(params);
  console.log(contents);
  doGet(contents, onErr, callback);
}

//获取单个视频的信息
function videoGet(videoID, callback){
  console.log('call videoGet');

  var params = generateParams('video.get');
  params['video_id'] = videoID;
  params['sign'] = generateSign(params, SECRET_KEY);

  var contents = qs.stringify(params);
  doGet(contents, onErr, callback);
}

//更新视频信息
function videoUpdate(videoID, videoName, videoDesc, tag, callback){
  console.log('call videoUpdate');

  var params = generateParams('video.update', USER_UNIQUE);
  params['video_id'] = videoID;
  if (videoName) params['video_name'] = videoName;
  if (videoDesc) params['video_desc'] = videoDesc;
  if (tag) params['tag'] = tag;
  params['sign'] = generateSign(params, SECRET_KEY);

  var contents = qs.stringify(params);
  doGet(contents, onErr, callback);
}

//删除视频
function videoDel(videoID, callback){
  console.log('call videoDel');

  var params = generateParams('video.del');
  params['video_id'] = videoID;
  params['sign'] = generateSign(params, SECRET_KEY);

  var contents = qs.stringify(params);
  doGet(contents, onErr, callback);
}


module.exports.uploadInit = uploadInit;
module.exports.uploadResume = uploadResume;
module.exports.videoList = videoList;
module.exports.videoGet = videoGet;
module.exports.videoUpdate = videoUpdate;
module.exports.videoDel = videoDel;

//module.exports = uploadInit;











