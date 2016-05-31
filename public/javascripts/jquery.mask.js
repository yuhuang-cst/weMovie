(function($){
	$.fn.extend({
		/**
		 * 打开遮罩，并显示一段文字。
		 * @param  {String} msg    [显示的文字]
		 * @param  {String} imgsrc [图片的位置]
		 * @return {void}       
		 */
		openMask:function(imgsrc){
//			var loadDiv=$("body").find("._mask_loadDiv");
			var loadDiv=this.find("._mask_loadDiv");
			if(!loadDiv || !loadDiv[0]){	// add Mask 
				var loadDiv=$("<div class='_mask_loadDiv' style='position:relative; text-align:center; margin-top:-400px; z-index:10; background:#FFF; border:1px solid #ACE'></div>");
				
				if(!imgsrc){	// 指定默认的图片
					// var scripts=document.getElementsByTagName("script");
					// for(var i=0; i<scripts.length; i++){
					// 	if(scripts[i].src.indexOf("mask")!=-1){
					// 		var scriptSrc=scripts[i].src;
					// 		var uri=scriptSrc.substring(0,scriptSrc.lastIndexOf("/"));
					// 		imgsrc=uri+"/images/mask_loading.gif";
					// 	}
					// }
					imgsrc="/images/mask_loading.gif"
				}

				var contentDiv=$("<div class='_mask_content' style='position:relative;text-align:center;margin-top:140px;' >");
				//loadDiv的宽度= msg的宽度+img的宽度
				var loadDiv_width=590;
				var loadDiv_height=400;
				contentDiv.css("width",loadDiv_width);
				loadDiv.css("width",loadDiv_width);
				loadDiv.css("height",loadDiv_height);
				if(imgsrc){
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

