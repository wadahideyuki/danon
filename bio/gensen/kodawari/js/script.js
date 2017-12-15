;(function($) {
	$(function(){
		//ロード終了後に処理
		$("#page-body .container").on("loadcomplete", function(e){
			//ページ到達管理初期化
			initReachObservation();
			//モーダルクリック監視
			initModalClickObservation();
		});

	});
	//ページ到達管理初期化
	var bottomReached = false;
	function initReachObservation(){
		$(window).on("scroll resize orientationchange", function(e){
			var valScroll = $(window).scrollTop() + window.innerHeight;
			var lbl = "";
			switch((location.pathname).split("/")[4]){
				case "mangomandarin":
					lbl = "true(マンゴー＆マンダリン)";
					break;
				case "pearfruitsmix":
					lbl = "true(洋梨フルーツミックス)";
					break;
				case "wakankitsublend":
					lbl = "true(季節限定 国産和柑橘ブレンド)";
					break;
			}
			//到達地点更新時処理
			if((! bottomReached) && (valScroll >= ($(document).height()))){
				bottomReached = true;
				console.log("到達：", "pageEndReached", lbl);
				dataLayer.push({
					'event': 'pageEndReached',
					'hasReachedEnd': lbl
				});
			}
		}).trigger("scroll");
	}
	//モーダルクリック監視
	function initModalClickObservation(){
		$(document).on("click","a[data-modaal-scope]",function(e){
			console.log("クリック", "modalOpened", $(this).attr("href"));
			dataLayer.push({
				'event': 'modalOpened',
				'modalId': $(this).attr("href")
			});
		});
	}
})(jQuery);
