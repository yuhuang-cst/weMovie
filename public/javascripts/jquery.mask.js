(function($){
	$.fn.extend({
		/**
		 * 打开遮罩，并显示一段文字。
		 * @param  {String} msg    [显示的文字]
		 * @param  {String} imgsrc [图片的位置]
		 * @return {void}       
		 */
		openMask:function(status){
			var loadDiv=this.find("._mask_loadDiv");
			if(!loadDiv || !loadDiv[0] || (loadDiv[0].id != status)){	// add Mask 
				var loadDiv=$("<div class='_mask_loadDiv' style='position:relative; text-align:center; margin-top:-400px; z-index:10; background:#FFF; border:1px solid #ACE'></div>");			
				var imgsrc;
				if(status == "notBegin") {
					imgsrc="";
				}
				else if(status == "loading") {
					imgsrc="/images/mask_loading.gif";
				}
				else {
					imgsrc="/images/mask_over.png";
				} 
				var contentDiv=$("<div class='_mask_content' style='position:relative;text-align:center;margin-top:140px;' >");
				//loadDiv的宽度= msg的宽度+img的宽度
				var loadDiv_width=590;
				var loadDiv_height=400;
				contentDiv.css("width",loadDiv_width);
				loadDiv.id=status;
				loadDiv.css("width",loadDiv_width);
				loadDiv.css("height",loadDiv_height);
				if (status == "notBegin") {
					var clockDiv=$("<div id='countdown2' class='ClassyCountdownDemo' style='height:80px'>");
  clockDiv.ClassyCountdown({
                                end: '1388468325',
                                now: '1378441323',
                                labels: true,
                                style: {
                                    element: "",
                                    textResponsive: .5,
                                    days: {
                                        gauge: {
                                            thickness: .01,
                                            bgColor: "rgba(0,0,0,0.05)",
                                            fgColor: "#1abc9c"
                                        },
                                        textCSS: 'font-family:\'Microsoft YaHei\'; font-size:25px; font-weight:300; color:#34495e;'
                                    },
                                    hours: {
                                        gauge: {
                                            thickness: .01,
                                            bgColor: "rgba(0,0,0,0.05)",
                                            fgColor: "#2980b9"
                                        },
                                        textCSS: 'font-family:\'Microsoft YaHei\'; font-size:25px; font-weight:300; color:#34495e;'
                                    },
                                    minutes: {
                                        gauge: {
                                            thickness: .01,
                                            bgColor: "rgba(0,0,0,0.05)",
                                            fgColor: "#8e44ad"
                                        },
                                        textCSS: 'font-family:\'Microsoft YaHei\'; font-size:25px; font-weight:300; color:#34495e;'
                                    },
                                    seconds: {
                                        gauge: {
                                            thickness: .01,
                                            bgColor: "rgba(0,0,0,0.05)",
                                            fgColor: "#f39c12"
                                        },
                                        textCSS: 'font-family:\'Microsoft YaHei\'; font-size:25px; font-weight:300; color:#34495e;'
                                    }

                                },
                                onEndCallback: function() {
                                    console.log("Time out!");
                                }
                            });
					contentDiv.append(clockDiv);

				} else if((status != "notBegin") && imgsrc){
					contentDiv.append("<img src='"+imgsrc+"' style='width:80px; height:80px'>");
				} 
				this.append(loadDiv.append(contentDiv));
			}
			loadDiv.css("z-index",10).css("display","block");
			return this;
		},
		closeMask:function(){
	//		var loadDiv=$("body").find("._mask_loadDiv");
			var loadDiv=this.find("._mask_loadDiv");
			if(loadDiv)
				loadDiv.css("display","none").css("z-index",-99999);
			return this;
		}
	});
})(jQuery);

