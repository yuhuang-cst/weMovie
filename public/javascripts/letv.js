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





