var http = require("http");
var qs = require("querystring");
var crypto = require('crypto');
var Buffer = require("buffer").Buffer


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
  for (var i in keys)
    keyStr += keys[i] + params[keys[i]];
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

/*
function onUploadInitData(data){
  data = JSON.parse(data.toString());
  console.log('code: ', data['code']);
  if (data['code'] != 0)
    return;
  for (key in data){
    console.log(key, ': ', data[key]);
  }
}*/

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


function uploadInit(filename, filesize, uploadtype, callBack){
  console.log('call uploadInit()');
  var USER_UNIQUE = 'm9rv3asjdc'
  var SECRET_KEY = '4f4783bb2ef51291154f3db3d4f62ce5'

  var params = generateParams('video.upload.init', USER_UNIQUE);
  params['video_name'] = filename;
  params['file_size'] = filesize;
  //params['client_ip'] = ip;
  params['uploadtype'] = uploadtype;
  params['sign'] = generateSign(params, SECRET_KEY);

  var contents = qs.stringify(params);
  doGet(contents, onErr, callBack);
}


function videoList(videoName, callBack, index, size, status){
  console.log('call videoList');
  var USER_UNIQUE = 'm9rv3asjdc';
  var SECRET_KEY = '4f4783bb2ef51291154f3db3d4f62ce5';

  var params = generateParams('video.list', USER_UNIQUE);
  params['videoName'] = videoName;
  if (index)  params['index'] = index;
  if (size)  params['size'] = size;

  var contents = qs.stringify(params);
  doGet(contents, onErr, callBack);
}


module.exports.uploadInit = uploadInit;
module.exports.videoList = videoList;

//module.exports = uploadInit;











