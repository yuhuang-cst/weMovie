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

function seekToImprove(){
  var time = ( Date.now() - startTime.getTime() ) / 1000;
  log('time = ');
  log(time);
  player.sdk.seekTo(time);
  var seekTotime = getVideoTime();
  log('seekTotime = ');
  log(seekTotime);
  log('seekTotime = ' + seekTotime + '; time = ', time);
  if (Math.abs(seekTotime - time) > 2){
    log('pauseVideo');
    player.sdk.pauseVideo();
  }
  else{
    log('clearInterval')
    clearInterval(interval);
  }
}
function callBack(type, data){
    var log = document.getElementById("log");
    var myDate = new Date();
    log.innerHTML += "<span>" + myDate.toLocaleTimeString() + "</span>" + "===>" + "type: " + type + ";data: " + JSON.stringify(data) + "<br>";
    if (type == 'playerStart'){
      interval = setInterval(seekToImprove, 1000);
      
    }
}

//var startTime = new Date('2016-5-6 15:40:00')
var startTime = Date.now();

var player = new CloudVodPlayer();

/*
var letvcloud_player_conf =  {"uu":"m9rv3asjdc","vu":"f92a7d4cc6","auto_play":1,"gpcflag":1,"width":640,"height":360, start : 13, callbackJs : "callBack"};
*/

var letvcloud_player_conf = {"uu" : "1wnmvkv1dr", vu:"86e12dca1b", "auto_play":1,"gpcflag":1,"width":640,"height":360, start : 13, callbackJs : "callBack"};

player.init(letvcloud_player_conf);



