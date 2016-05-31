function playNewId(){
    var conf = document.getElementById("playNewIdArg").value;
    player.sdk.playNewId(conf);
}
function seekTo(){
    //从某一时间点开始播放，不能精确到每一秒
    var time = document.getElementById("seekToArg").value;
    player.sdk.seekTo(time);
    getVideoTime();
}
function setVolume(){
    //设置音量，音量值为0~1
    var volume = document.getElementById("setVolumeArg").value;
    player.sdk.setVolume(volume);
}
function setDefinition(){
    //设置码流
    var definition = document.getElementById("setDefinitionArg").value;
    player.sdk.setDefinition(definition);
}
function pauseVideo(){
    //暂停视频
    player.sdk.pauseVideo();
}
function resumeVideo(){
    //从暂停处重新播放
    player.sdk.resumeVideo();
}
function replayVideo(){
    //重播
    player.sdk.replayVideo();
}
function closeVideo(){
    //关闭视频
    player.sdk.closeVideo();
}
function startUp(){
    //非自动播放时，启动视频
    player.sdk.startUp();
}
function shutDown(){
    //结束视频，不知道与closeVideo的区别
    player.sdk.shutDown();
}
function output(data){
    return;
    var result;
    if (typeof(data) == "object")
        result = "" + JSON.stringify(data) + "\n";
    else
        result = "" + data + "\n";
    result = result.replace(/\n/g, "<br>");
    document.getElementById("output").innerHTML = result;
}
function log(data){
  var log = document.getElementById("log");
  log.innerHTML += data + "<br>";
}
function getVideoSetting(){
    //获得视频信息
    var setting = player.sdk.getVideoSetting();
    output(setting);
}
function getVideoTime(){
    //获得视频已播放过的时间，如106.928，单位秒
    var time = player.sdk.getVideoTime();
    output(time);
    return time;
}
function getDefinition(){
    //获得码流
    var definition = player.sdk.getDefinition();
    output(definition);
}
function getDefinitionList(){
    //获得码流列表
    var definitionList = player.sdk.getDefinitionList();
    output(definitionList);
}
function getLoadPercent(){
    //获得下载进度
    var loadPercent = player.sdk.getLoadPercent();
    output(loadPercent);
}
function getVersion(){
    //获得播放器版本号
    var version = player.sdk.getVersion();
    output(version);
}


var lastType = '';
var synchronized = true;    //已经同步完毕
var videoOn = false;

var BEFORE_PLAYING = -1;
var PLAYING = 0;
var AFTER_PLAYING = 1;

var isSynchronizing = false;

var startUp = false; //视频刚刚从开头开始播放

function getTimeStatus(){
  if (Date.now() < beginTime)
    return BEFORE_PLAYING;
  else if (Date.now() > endTime)
    return AFTER_PLAYING;
  else
    return PLAYING;
}

function secondsToDD_HH_MM_SS(seconds){
  var timeDict = {};
  timeDict['days'] = Math.floor(seconds / 86400);
  seconds -= timeDict['days'] * 86400;
  timeDict['hours'] = Math.floor(seconds / 3600);
  seconds -= timeDict['hours'] * 3600;
  timeDict['minutes'] = Math.floor(seconds / 60);
  seconds -= timeDict['minutes'] * 60;
  timeDict['seconds'] = Math.floor(seconds);
  return timeDict;
}

function beginTimeMonitor(){
  var timeDict = secondsToDD_HH_MM_SS( (beginTime.getTime() - Date.now()) / 1000);
  console.log('距离播放还有：%d天%d时%d分%d秒', timeDict['days'], timeDict['hours'], timeDict['minutes'], timeDict['seconds']);
  if (getTimeStatus() == PLAYING){
    player.sdk.resumeVideo();
    tvDiv.closeMask();
    clearInterval(beginTimeCounter);
  }
}


//播放同步
function synchronize(){
  var elapsed = ( Date.now() - beginTime.getTime() ) / 1000;
  player.sdk.seekTo(elapsed);
  var synJudge = setTimeout(function(){//由于seekTo似乎为非阻塞，导致有时getVideoTime所得为seekTo之前的时间，故设置延迟函数
    var seekTotime = getVideoTime();
    //console.log('elapsed = ', Math.floor(elapsed / 60), elapsed - Math.floor(elapsed / 60) * 60);
    //console.log('seekTotime = ', Math.floor(seekTotime / 60), seekTotime - Math.floor(seekTotime / 60) * 60);
    if (Math.abs(seekTotime - elapsed) > 2)  { //同步到误差小于1秒停止
      if (synchronized == true)
        return
      player.sdk.pauseVideo();
    } 
    else{
      synchronized = true;
      console.log('同步完毕！');
      tvDiv.closeMask();
      clearTimeout(synJudge);
      clearInterval(synchroCounter);
    }
  },150);
}

function synchro(){
  console.log('开始同步');
  tvDiv.openMask();
  if (synchronized == false)//正在执行同步函数
    return;
  synchronized = false;
  synchroCounter = setInterval(synchronize, 600);
}

//播放的回调函数
function playCallBack(type, data){
  /*
  var log = document.getElementById("log");
  var myDate = new Date();
  log.innerHTML += "<span>" + myDate.toLocaleTimeString() + "</span>" + "===>" + "type: " + type + ";data: " + JSON.stringify(data) + "<br>";*/
  //console.log('lastType = ', lastType);

  if (type == 'playerStart'){//若视频从开头开始播放
    var timeStatus = getTimeStatus();

    if (timeStatus == BEFORE_PLAYING){//播放时间未到
      startUp == true;
      tvDiv.openMask();
      player.sdk.pauseVideo();
      beginTimeCounter = setInterval(beginTimeMonitor, 1000);//监听时间，准备播放
    }
    else if (timeStatus == AFTER_PLAYING){//播放已经结束
      console.log('播放结束');
      tvDiv.openMask();
      player.sdk.closeVideo();
    }
    else { //正在播放
      synchro();
    }
  }

  if (type == 'videoResume' && !startUp){ //若视频由暂停恢复 且 非视频开头
    synchro();
  }

  if (lastType == 'videoEmpty' && type == 'videoFull'){//若视频从缓存不足中恢复
    synchro();
  } 

  lastType = type;
  startUp = false;
}












