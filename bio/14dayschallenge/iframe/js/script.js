var isDebug = true;

//本番用にはこれをコメントアウトしてconsole.logを無効化
if(! isDebug){
	window.console = {};
	window.console.log = function(i){return;};
	window.console.time = function(i){return;};
	window.console.timeEnd = function(i){return;};
}

//alert(window.matchMedia("(max-width: 1040px)").matches);

;(function($) {
	$(function(){

		//iOS処理
		var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		if(iOS){
			$("html").addClass("iOS");
			var q = query2object(), sW;
			if(q != undefined){
				$("html").addClass(q.mode[0]);
				$(window).on("resize scroll orientationchange", function(e){
					sW = window.innerWidth;
					//$("body").css("width", sW + "px");
					$("body").css("width", "100vw");
				}).delay(1000).trigger("resize");
			}
		}

		//フォーム初期化
		initForm();

		//メインビジュアル切り替え機構初期化
		/*
		var slideInterval = 5000;	//切り替え間隔（ミリ秒）
		setInterval(function(){
			$("body>header").toggleClass("slide-2");
		}, slideInterval);
		*/

		//SNSボタン挙動
		$(".sns-btns>.twitter>a").on("click", function(e){
			e.preventDefault();
			window.open($(this).attr("href"),'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1');
		});
		$(".sns-btns>.facebook>a").on("click", function(e){
			e.preventDefault();
			window.open($(this).attr("href"),'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1');
		});

		//PROFILE系処理
		//モーダル：背景クリックで閉じる（スタート画面を除く）
		$("#modal").on("click", function(e){
			if($(e.target).is("#modal")){
				hideModal();
			}
		});
		$(".btn-modal-closer").on("click", function(e){
			e.preventDefault();
			hideModal();
		});
		$(".btn-profile").on("click", function(e){
			e.preventDefault();
			showModal($(this).attr("href").substr(1));
		});

		//スクロールリンク初期化
		initScrollLink();

	});
	function initForm(){
		$("#input input:checkbox, #input input:radio").on("change", onChecked);
		$("#input-submit a").on("click", function(e){
			e.preventDefault();
			if($(this).is(":not(.disabled)")){
				showResult();
			}
		});
	}
	function onChecked(e){
		//console.log("onChecked");
		//一旦Q2以降を無効化
		$("#input #q2 input:radio, #input #q3 input:radio, #input #q4 input:radio, #input-submit").attr("disabled", "disabled");
		$("#q2, #q3, #q4, #input-submit").removeClass("enabled");
		//選択状態に応じてフォームを有効化
		if(($("#input input[name='sex']:checked").length != 0)&&($("#input input[name='age']:checked").length != 0)){
			$("#q2 input:radio").removeAttr("disabled");
			$("#q2").addClass("enabled");
			if($("#input input[name='diet']:checked").length != 0){
				$("#q3 input:checkbox").removeAttr("disabled");
				$("#q3").addClass("enabled");
				if($("#input input[name='bowel']:checked").length != 0){
					$("#q4 input:radio").removeAttr("disabled");
					$("#q4").addClass("enabled");
					if($("#input input[name='activity']:checked").length != 0){
						$("#input-submit a").removeClass("disabled");
						$("#input-submit").addClass("enabled");
					}
				}
			}
		}
	}
	function showResult(){
		//親フレームにデータ送信
		parent.postMessage("showResult:"+$("#join-content").offset().top,"*");
		//オートスクロール
		$("html,body")
			.stop()
			.animate({
				scrollTop:$("#join-content").offset().top
			}, {
				duration: 300
			});
		//結果判定
		var course, lv;
		switch(parseInt($("input[name='diet']:checked").val())){
			case 1:
				course = "a";
				break;
			case 2:
				course = "b";
				break;
			case 3:
				course = "c";
				break;
		}
		switch(parseInt($("input[name='activity']:checked").val())){
			case 1:
				lv = 1;
				break;
			case 2:
			case 3:
				lv = 2;
				break;
			case 4:
				lv = 0;
				break;
		}
		//APIに値送出
		var valSex = $("#input input[name='sex']:checked").val();
		var valAge = $("#input input[name='age']:checked").val();
		var valDiet = $("#input input[name='diet']:checked").val();
		var valActivity = $("#input input[name='activity']:checked").val();
		var valBowel = "";
		$("#input input[name='bowel']:checked").each(function(i){
			valBowel += $(this).val();
		});
		$.ajax({
			url: "/14dayschallenge/api/log.php",
			type: "GET",
			data: {
				sex: valSex,
				age: valAge,
				diet: valDiet,
				bowel: valBowel,
				activity: valActivity
			},
			dataType: "html"
		})
			.done(function( data, textStatus, jqXHR ) {
				//console.log("ajax.done");
			})
			.fail(function( jqXHR, textStatus, errorThrown ) {
				//console.log("ajax.fail");
			})
			.always(function( jqXHR, textStatus ) {
				//console.log("ajax.always");
			});


		//トラッキングコード送出
		ga('send', 'event', 'shindan', 'shindan-result', 'shindan-complete');
		//console.log('send', 'event', 'shindan', 'shindan-result', 'shindan-complete');

		//CVタグ送出
		loadConversionScript();


		//メール起動リンク設定
		var href = $(".how-to-acccess a.mail").attr("href") + course + lv;

		var mailSubject = "%E6%AF%8E%E6%97%A5%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8MENU%E3%80%80supported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA";
		var mailBody;
		switch(course + lv){
			case "a0":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Da0%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Da0%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "a1":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Da1%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Da1%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "a2":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Da2%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Da2%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "b0":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Db0%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Db0%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "b1":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Db1%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Db1%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "b2":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Db2%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Db2%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "c0":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Dc0%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Dc0%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "c1":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Dc1%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Dc1%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
			case "c2":
				mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fwww.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Dc2%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				//mailBody = "%E3%81%82%E3%81%AA%E3%81%9F%E5%B0%82%E7%94%A8%E3%81%AE%E3%80%8114%E6%97%A5%E9%96%93%E3%83%81%E3%83%A3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%AF%E3%81%93%E3%81%A1%E3%82%89%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%20%0D%0A%0D%0Ahttp%3A%2F%2Fstg.danone.co.jp%2F14dayschallenge%2Fapp%2F%3Fcourse%3Dc2%0D%0A%0D%0A%E3%81%93%E3%82%8C%E3%82%92%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%81%AB%E3%80%81%E6%AF%8E%E6%97%A5%E3%81%AE%E8%87%AA%E5%88%86%E3%82%92%E5%A4%89%E3%81%88%E3%82%88%E3%81%86%EF%BC%81%20%0D%0A%E3%81%BE%E3%81%9A%E3%81%AF14%E6%97%A5%E9%96%93%E7%B6%9A%E3%81%91%E3%81%A6%E3%80%81%E3%81%82%E3%81%AA%E3%81%9F%E3%82%82%E3%82%B9%E3%83%83%E3%82%AD%E3%83%AA%E4%BD%93%E9%A8%93%E3%82%92%E7%9B%AE%E6%8C%87%E3%81%97%E3%81%BE%E3%81%97%E3%82%87%E3%81%86%E3%80%82%20%0D%0A%0D%0Asupported%20by%20%E3%83%80%E3%83%8E%E3%83%B3%E3%83%93%E3%82%AA%20";
				break;
		}

		$(".how-to-acccess a.mail").attr("href", "mailto:?subject=" + mailSubject + "&body=" + mailBody);
		$(".how-to-acccess a.page").attr("href", "/14dayschallenge/app/?course="+ course + lv);
		//結果画面オープン
		$("#result").addClass("result-"+course+" lv-"+lv+" open");
	}

	function showModal(contentId){
		console.log("showModal", contentId);
		$("body").addClass("modal-open");
		$("#modal")
			.removeClass()
			.addClass(contentId)
			.stop()
			.fadeIn()
			.scrollTop(0);
	}
	function hideModal(){
		//消去
		$("#modal").stop().fadeOut(function(){
			$("body").removeClass("modal-open");
			$("#modal").removeClass();
		});
	}
	function initScrollLink(){
		$("a.link-join, #pagetop>a").on("click", function(e){
			//親フレームにデータ送信
			parent.postMessage("showResult:"+$($(this).attr("href")).offset().top,"*");
		});
	}

})(jQuery);

//URLのクエリストリングをオブジェクト化
function query2object(){
	var q = location.search.split("?"), a, i, s, o;
	if(q.length > 1){
		o = {};
		q = q[1];
		a = q.split("&");
		for(i=0;i<a.length;i++){
			s = a[i].split("=");
			if(!o[s[0]]){
				o[s[0]] = [s[1]];
			}else{
				o[s[0]].push(s[1]);
			}
		}
	}
	return o;
}

/**
 * 広告CVタグの動的読み込み
 */

function loadConversionScript(){
	console.log("loadConversionScript");
	var oldDocumentWrite = document.write;
	document.write = function(node){
		$("body").append(node)
	};
	//Google Code for [FY2017-Q2] CV1_14daysCallenge Conversion Page
	$.getScript( "//www.googleadservices.com/pagead/conversion.js", function() {
		setTimeout(function() {
			//Yahoo Code for your Conversion Page
			$.getScript( "//s.yimg.jp/images/listing/tool/cv/conversion.js", function() {
				setTimeout(function() {
					//Docomo code for brand website
					$.getScript( '//cdn.adnwif.smt.docomo.ne.jp/scripts/conv/conversion.js' + '?' + (+new Date()+"").slice(0,-8), function() {
						setTimeout(function() {
							//Ameba
							$.getScript( "//pv.amanad.adtdp.com/-r7wfltP_CD0BMKDIQMIAQ/pv.js?pg=ZOPvaQPCXSw", function() {
								setTimeout(function() {
									document.write = oldDocumentWrite
								}, 100)
							});
						}, 100)
					});
				}, 100)
			});
		}, 100)
	});
}


/**
 * スムーズスクロール
 */

/*
$(document).ready(function(){
    $("#pagetop a").hide();
    $(window).on("scroll", function() {
        if ($(this).scrollTop() > 100) {
            $("#pagetop a").fadeIn("fast");
        } else {
            $("#pagetop a").fadeOut("fast");
        }
    });
    $('#pagetop a').click(function () {
        $('body,html').animate({
        scrollTop: 0
        }, 400);
        return false;
    });
});
*/

