/*
 *hichat v0.4.2
 *Wayou Mar 28,2014
 *MIT license
 *view on GitHub:https://github.com/wayou/HiChat
 *see it in action:http://hichat.herokuapp.com/
 */
window.onload = function() {
  var hichat = new HiChat();
  hichat.init();
};
var HiChat = function() {
  this.socket = null;
};
HiChat.prototype = {
  init: function() {
    var that = this;
    var socket=io.connect(),//与服务器进行连接
				button=document.getElementById('sendBtn');
		button.onclick=function(){
			socket.emit('foo', 'hello');//发送一个名为foo的事件，并且传递一个字符串数据‘hello’
		}    
	}
};
