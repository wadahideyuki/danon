var iOSviewportW = 0;
var ua = navigator.userAgent.toLowerCase();
var isiOS = (ua.indexOf("iphone") > -1) || (ua.indexOf("ipod") > -1) || (ua.indexOf("ipad") > -1);
if(isiOS){
	iOSviewportW = document.documentElement.clientWidth;
}
function updateMetaViewport(){
	var viewportContent;
	var w = window.outerWidth;
	if(isiOS){
		w = iOSviewportW;
	}
	if((768 <= w) && (w < 1040)) {
		viewportContent = "width=1040px,user-scalable=no,shrink-to-fit=yes";
	}else if(w < 360){
		viewportContent = "width=360px,user-scalable=no,shrink-to-fit=yes";
	}else{
		viewportContent = "width=device-width,user-scalable=no,shrink-to-fit=yes";
	}
	document.querySelector("meta[name='viewport']").setAttribute("content", viewportContent);
}
//イベントハンドラ登録
window.addEventListener("resize", updateMetaViewport, false);
window.addEventListener("orientationchange", updateMetaViewport, false);
//初回イベント強制発動
var ev = document.createEvent("UIEvent");
ev.initEvent("resize", true, true)
window.dispatchEvent(ev);