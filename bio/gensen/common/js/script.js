var isDebug = false;
if(! isDebug){
	window.console = {};
	window.console.log = function(i){return;};
	window.console.time = function(i){return;};
	window.console.timeEnd = function(i){return;};
}

;(function($) {
	/**
	 * グローバル関数
	 */
	var Func = window.Func = function(elem){
		return new Func.fn.init(elem);
	};
	Func.fn = {
		init:function(elem){
		}
	};
	Func.fn.init.prototype = Func.fn;
	Func.util = {
		isPC: function(){
			if($("#page-header>.inner>#global-nav-toggler+label").css("display") == "none"){
				return true;
			}else{
				return false;
			}
		},
		getHeaderOffset: function(){
			switch(true){
				case (Func.util.isPC()):
					return $("#page-header").height();
					break;
				case (! Func.util.isPC()):
					switch(true){
						case ($(".fruits-features").length > 0):
							return 111;
							break;
						case ($(".kodawariContent").length > 0):
							return 140;
							break;
						default:
							return 70;
							break;
					}
					break;
			}
		}
	};

	/**
	 * DOM Ready処理
	 */
	$(function(){
		//スムーススクロール初期化
		initSmoothScroll();

		//ローカルナビ初期化
		initLocalNav();

		//SNSボタン初期化
		initSnsBtns();

	});
	//スムーススクロール初期化
	function initSmoothScroll(){
		var href, hash;
		$("a").each(function(i){
			href = $(this).attr("href");
			hash = "";
			switch(true){
				case ((href.charAt(0) == "#") && (href.length > 1)):
					hash = href;
					break;
				case (href.indexOf(location.pathname + "#") == 0):
					hash = href.split(location.pathname)[1];
					break;
			}
			if(hash != ""){
				$(this).on("click", {hash:hash}, function(e){
					e.preventDefault();
					smoothScrollTo(e.data.hash);
				});
			}
		});
		if(location.hash){
			smoothScrollTo(location.hash);
		}
	}
	function smoothScrollTo(elemId){
		var offset = 0, speed = 500, position;
		offset = Func.util.getHeaderOffset();
		if($(elemId).length > 0){
			position = $(elemId).offset().top - offset;
			$("html, body").animate({scrollTop: position}, speed);
		}
	}

	//ローカルナビ初期化
	function initLocalNav(){
		$("#global-nav>ul>li")
			.on("mouseover", function(e){
				if(Func.util.isPC()){
					var navId = undefined;
					switch(true){
						case ($(this).is(":nth-child(1)")):
							navId = "secret";
							break;
						case ($(this).is(":nth-child(2)")):
							navId = "recipe";
							break;
					}
					if(navId){
						openLocalNav(navId);
					}
				}else{
					location.href = $(this).find("a").attr("href");
				}
			})
			.on("mouseout", function(e){
				if(Func.util.isPC()){
					closeLocalNav();
				}
			});
		$("#local-nav-container")
			.on("mouseenter", function(e){
				if(Func.util.isPC()){
					$("#local-nav-container").addClass("open");
				}
			})
			.on("mouseleave", function(e){
				if(Func.util.isPC()){
					$("#local-nav-container").removeClass();
					$("#local-nav-container .local-nav").removeClass("open");
				}
			});
		$("#local-nav-container .local-nav a")
			.on("mousedown", function(e){
				console.log("MOUSEDOWN");
				$(".local-nav-opener").prop("checked", false);
			});
	}
	function openLocalNav(navId){
		$("#local-nav-container").removeClass();
		$("#local-nav-container").addClass("open");
		if(navId){
			$("#local-nav-container").addClass(navId);
			$("#local-nav-container .local-nav").removeClass("open");
			$("#local-nav-container .local-nav#local-nav-" + navId).addClass("open");
		}
	}
	function closeLocalNav(){
		$("#local-nav-container").removeClass("open");
	}

	//SNSボタン初期化
	function initSnsBtns(){
		//SNSボタン挙動
		$("#sns-btns .twitter>a").on("click", function(e){
			e.preventDefault();
			window.open($(this).attr("href"),'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1');
		});
		$("#sns-btns .facebook>a").on("click", function(e){
			e.preventDefault();
			window.open($(this).attr("href"),'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1');
		});
	}



})(jQuery);