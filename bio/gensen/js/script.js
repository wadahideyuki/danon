function autoplayMutedSupported() {
	var v = document.createElement('video');
	v.muted = true;
	v.play();
	return !v.paused;
}

;(function($) {
	$(function(){
		if(_uac.isiOS){
			if(_uac.iosVer >= 10){
				$("html").addClass("ios10above");
			}
		}
		if(autoplayMutedSupported()){
			$("html").addClass("videoautoplay");
		}else{
			$("html").addClass("no-videoautoplay");
		}
	});
})(jQuery);