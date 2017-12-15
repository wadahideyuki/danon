;(function($) {
	$(function(){
		//ローカルナビ初期化
		initLocalNav();
		//モーダル初期化
		initModals();
		//ページ到達管理初期化
		initReachObservation();
	});
	//ローカルナビ初期化
	function initLocalNav(){
		$(window)
			.on("scroll resize orientationchange", function(e){
				var valScroll = $(window).scrollTop();
				var $target, posTop;
				$("#local-nav-secret a").each(function(i){
					$target = $("#" + $(this).attr("href").split("#")["1"]);
					if($target.length > 0){
						posTop = $target.position().top - Func.util.getHeaderOffset();
						if((valScroll >= posTop) && (valScroll < (posTop + $target.outerHeight()))){
							$(this).addClass("on");
						}else{
							$(this).removeClass("on");
						}
					}
				});
			})
			.trigger("scroll");
		$("#local-nav-secret a").on("click", function(e){
			var clickedLabel = $(this).text();
			console.log("クリック", clickedLabel, dataLayer);
			dataLayer.push({
				'event': 'localNavClicked',
				'clickedNav': clickedLabel
			});
			//ga('send', 'event', 'localnav', 'localnav-clicked', reachedLabel);
		});
	}
	//モーダル初期化
	function initModals(){
		$(".modal-launcher").each(function(i){
			$(this)
				.modaal({
					type: "ajax",
					width: 800,
					hide_close: true,
					overlay_opacity: 0.5,
					padding: 0,
					before_open: function(){
						var hrefArr = $($(this)[0].$elem[0]).attr("href").split("/");
						var path = hrefArr[hrefArr.length - 1];
						var label;
						switch(path){
							case "modal-1.html":
								label = "製品情報：完熟ストロベリー";
								break;
							case "modal-2.html":
								label = "製品情報：旬摘みブルーベリー";
								break;
							case "modal-3.html":
								label = "製品情報：ジューシーアロエ";
								break;
							case "modal-4.html":
								label = "製品情報：フレッシュ＆ドライ";
								break;
							case "modal-5.html":
								label = "製品情報：もぎたて白桃";
								break;
							case "modal-6.html":
								label = "製品情報：芳醇マダガスカル産バニラ";
								break;
							case "modal-7.html":
								label = "製品情報：マンゴー＆マンダリン";
								break;
							case "modal-8.html":
								label = "製品情報：洋梨フルーツミックス";
								break;
							case "modal-9.html":
								label = "製品情報：シチリア産レモン";
								break;
							case "modal-plainyogurt.html":
								label = "プレーンヨーグルトについて";
								break;
						}
						console.log("モーダル開扉：", label, dataLayer);
						dataLayer.push({
							'event': 'sozaiModalOpened',
							'openedModalLabel': label
						});
						//ga('send', 'event', 'modal', 'modal-opened', label);
					}
				})
				.on("close", function(e){
					$(this).modaal("close");
				});
		});
	}
	//ページ到達管理初期化
	var savedReachPos = -1;
	var valScroll, valReachPos, reachedLabel, observationInit = false;
	function initReachObservation(){
		$(window).on("scroll resize orientationchange", observeSections).trigger("scroll");
	}
	function observeSections(e){
		valScroll = $(window).scrollTop() + window.innerHeight;
		var reached;
		if(! observationInit){
			$("article#page-body>section:not([data-section-read])").each(function(i){
				reached = (valScroll > ($(this).position().top + $(this).height()));
				$(this).attr("data-section-reached", reached);
			});
			observationInit = true;
		}else{
			$("article#page-body>section:not([data-section-read])").each(function(i){
				reached = (valScroll > ($(this).position().top + $(this).height()));
				if(($(this).attr("data-section-reached") == "false") && reached){
					$(this).attr("data-section-read", true);
					reachedLabel = $(this).find(">header h2").text();
					console.log("到達：", reachedLabel, dataLayer);
					dataLayer.push({
						'event': 'sectionReached',
						'reachedSection': reachedLabel
					});
					//ga('send', 'event', 'section', 'section-reached', reachedLabel);
					switch($("article#page-body>section[data-section-read]").length){
						case 2:
							console.log("完読率：D");
							dataLayer.push({
								'event': 'sectionCompleted',
								'completedRate': "D"
							});
							//ga('send', 'event', 'section-completed', 'completedRate', 'D');
							break;
						case 4:
							console.log("完読率：C");
							dataLayer.push({
								'event': 'sectionCompleted',
								'completedRate': "C"
							});
							//ga('send', 'event', 'section-completed', 'completedRate', 'C');
							break;
						case 6:
							console.log("完読率：B");
							dataLayer.push({
								'event': 'sectionCompleted',
								'completedRate': "B"
							});
							//ga('send', 'event', 'section-completed', 'completedRate', 'B');
							break;
						case 9:
							console.log("完読率：A");
							dataLayer.push({
								'event': 'sectionCompleted',
								'completedRate': "A"
							});
							//ga('send', 'event', 'section-completed', 'completedRate', 'A');
							$(window).off("scroll resize orientationchange", observeSections);
							break;
					}
				}
				$(this).attr("data-section-reached", reached);
			});
		}
	}
})(jQuery);