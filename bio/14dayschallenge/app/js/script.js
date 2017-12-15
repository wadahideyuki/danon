var isDebug = true;

//本番用にはこれをコメントアウトしてconsole.logを無効化
if(! isDebug){
	window.console = {};
	window.console.log = function(i){return;};
	window.console.time = function(i){return;};
	window.console.timeEnd = function(i){return;};
}

;(function($) {
	var json, d, o, q, cs, lv, mmtNow, mmtNowBegin, mmtFirst, mmtAdviceLastOpened, mmtMenuOpen, diff, diffB, i, ii, val, tnCookieName, tnCookies;
	var turnId = 0, dayId = 0, oTurn, oDay, numTurn, savedTurnId, savedDayId;
	var arrFood, arrYogurt, arrExercise, arrJikkan, arrBowel;
	var dailyPeriod = [3,0,0];	//各日の区切り時間（時,分,秒）
	var advicePeriod = 4;	//ワンポイントアドバイスの表示インターバル（時間）
	var dayPerTurn = 14;	//各ターンの最大DAY数
	var currentMode = "main";	//現在のモード（main / reuslt）
	var oTimer;
	//var timerInterval = 10 * 1000;	//タイマー実施間隔（ミリ秒）
	var timerInterval = 10 * 1000;	//タイマー実施間隔（ミリ秒）
	var isHome = false;	//ホーム画面表示中か否かを示すフラグ
	$(function(){
		//ボタン類初期設定
		init();

		//クエリ読み込み
		q = query2object();
		if(!q){
			//クエリがついていなかったらキャンペーントップにリダイレクト
			location.href = "https://www.danone.co.jp/bio/14dayschallenge/";
		}
		//コース、LV取得
		cs = q.course[0].charAt(0);
		lv = parseInt(q.course[0].charAt(1));
		//コース内容等反映
		$("html").addClass("cs-"+cs+lv);
		$("#your-course em").text(cs.toUpperCase());

		//現在日付取得
		updateMmtNow();
		//Cookie読み込み
		json = Cookies.getJSON("json");
		tnCookies = {};
		if(json != undefined){
			for(i=0;i<json.tn.length;i++){
				tnCookieName = json.tn[i];
				tnCookies[tnCookieName] = Cookies.getJSON(tnCookieName);
			}
			if(isDebug){
				console.log("区切り時間上書き",parseInt(json.ph)+"時"+parseInt(json.pm)+"分");
				//区切り時間上書き
				dailyPeriod = [parseInt(json.ph), parseInt(json.pm), 0];
			}
			//現在日付取得
			updateMmtNow();
		}

		//Cookieの状態で処理分岐
		if(json != undefined){
			console.log("Cookie：あり");
			//Cookieの記録と現在のCS/LVは一致しているか？
			if(q.course[0] == (json.cs + json.lv)){
				console.log("Cookieの記録と現在のCS/LV：一致");
				setTurnId(json.tn.length - 1);
				//再訪トラッキングコード
				if(json.ga == 0){
					console.log("再訪トラッキングコード未送出");
					//トラッキングコード送出
					ga('send', 'event', 'repeat', 'repeat-access', 'repeat-complete');
					//console.log('send', 'event', 'repeat', 'repeat-access', 'repeat-complete');
					//$("a#repeat-tracker").trigger("click");
					/*dataLayer.push({
						'event': 'click',
						'eventCategory': 'repeat',
						'eventAction': 'rpeat-access',
						'eventLabel': 'repeat-complete'
					});*/
					//json更新
					json.ga = 1;
				}
				//実行中のターンはあるか？（最新のターンは現在実行中か？）
				if(oTurn.s == 0){
					console.log("最新のターンは現在：実行中");
					//実行中ターン初日の開始時刻を取得
					setMmtFirst(oTurn.y, oTurn.m, oTurn.d);
					//実行中ターンの最新日をセット
					setDayId(oTurn.l.length - 1);
					//Cookie上の実行中ターンの最新日と現在日付の差を取得
					diff = mmtNowBegin.diff(moment(mmtFirst).add(dayId, "days"), "days");
					//Cookie上の実行中ターンの初日と現在日付の差を取得
					diffB = mmtNowBegin.diff(mmtFirst, "days");
					//Cookie上の実行中ターンの最新日と現在日付は一致するか？
					if((diff == 0) && (diffB < dayPerTurn)){
						console.log("Cookie上の実行中ターンの最新日と現在日付は：一致");
						//データ更新
						updateData();
						//変数更新
						updateVars();
						//ホーム画面表示更新
						updateHomeScreen();
					}else{
						console.log("Cookie上の実行中ターンの最新日と現在日付は：不一致");
						//Cookie上の最新日と現在日付の差が13日以内か？
						if((diff < dayPerTurn) && (diffB < dayPerTurn)){
							console.log("Cookie上の最新日と現在日付の差：13日以内");
							//Cookie上の最新日と現在日付の間の空白日付分のダミーデータを作成
							for(i=0;i<diff;i++){
								//DAYデータ新規作成
								addDayData(turnId);
							}
							//データ更新
							updateData();
							//変数更新
							updateVars();
							//ホーム画面表示更新
							updateHomeScreen();
						}else{
							console.log("Cookie上の最新日と現在日付の差：14日以上");
							//Cookie上の実行中のターンの記録を「終了」に変更
							oTurn.s = 1;
							//新ターンデータ作成
							addTurnData();
							//DAYデータ新規作成
							addDayData(json.tn.length - 1);
							//データ更新
							updateData();
							//変数更新
							updateVars();
							//ホーム画面表示更新
							updateHomeScreen();
						}
					}
				}else{
					console.log("最新のターンは現在：終了済み");
					//実行中のデータを終了済みへ
					oTurn.s = 1;
					//新ターンデータ作成
					addTurnData();
					//DAYデータ新規作成
					addDayData(json.tn.length - 1);
					//データ更新
					updateData();
					//変数更新
					updateVars();
					//ホーム画面表示更新
					updateHomeScreen();
				}
			}else{
				console.log("Cookieの記録と現在のCS/LV：不一致");
				//Cookieのクリア
				clearAllCookies();
				//基準値と異なればSTART画面を表示
				showStartScreen();
			}
		}else{
			console.log("Cookie：なし");
			//Cookieが無ければSTART画面を表示
			showStartScreen();
		}
		//リサイズ処理
		$(window).on("scroll orientationchange resize", function(e){
			onResize();
		}).trigger("resize");
	});

	//turnIdセット関数
	function setTurnId(val){
		console.log("setTurnId", val);
		turnId = val;
		tnCookieName = json.tn[val];
		oTurn = tnCookies[json.tn[val]];
	}

	//dayIdセット関数
	function setDayId(val){
		console.log("setDayId", val);
		dayId = val;
		oDay = oTurn.l[val];
	}


	//ボタン類初期設定
	function init(){
		console.log("init");

		//モーダル：開くボタン
		$(".modal-launcher").on("click", function(e){
			var href = $(this).attr("href");
			if(href.charAt(0) == "#"){
				e.preventDefault();
				openModal(href.substr(1));
			}
		});
		//モーダル：閉じるボタン
		$(".modal-closer").on("click", function(e){
			e.preventDefault();
			closeModal();
			//ホーム画面表示更新
			updateHomeScreen();
		});
		/*
		//モーダル：背景クリックで閉じる（スタート画面を除く）
		$("#modal").on("click", function(e){
			if(($(e.target).is("#modal"))&&(! $(e.target).is(".modal-start"))){
				closeModal();
			}
		});
		*/
		//これまでの結果を見るボタン
		$("#btn-log-all").on("click", function(e){
			e.preventDefault();
			switchMode("result");
		});
		$("#result a.btn-top").on("click", function(e){
			e.preventDefault();
			switchMode("main");
		});
		//#day-indicator
		$("#day-indicator>ul>li").each(function(i){
			$(this).on("click", function(e){
				if($(this).is(".done") || $(this).is(".today")){
					//表示中ではないDAYがクリックされたら処理
					if(i != dayId){
						console.log("day-indicator:click", i, dayId);
						//dayId変更
						setDayId(i);
						//変数更新
						updateVars();
						//ホーム画面表示更新
						updateHomeScreen();
					}
				}
			});
		});
		//#menuボタン
		$("#menu>ul>li>a").on("click", function(e){
			e.preventDefault();
			switch($(this).attr("href")){
				case "#modal-food":
					openMenu("food");
					break;
				case "#modal-yogurt":
					openMenu("yogurt");
					break;
				case "#modal-exercise":
					openMenu("exercise");
					break;
				case "#modal-jikkan":
					openMenu("jikkan");
					break;
				case "#modal-bowel":
					openMenu("bowel");
					break;
			}
		});
		$(".modal-checksheet a.btn-close").on("click", function(e){
			e.preventDefault();
			closeMenu();
		});
		//#modal-adviceの閉じるボタン
		$(".modal-advice>a.btn-close").on("click", function(e){
			e.preventDefault();
			//ADVICEコンテンツ消去
			hideModalContent($(this).data("nextContent"));
		});
		//チェックシート
		$(".modal-checksheet input[type='checkbox'], .modal-checksheet input[type='radio']").on("change", onFormChange);
		//結果画面
		$(document).on("click", ".result-unit>table>tbody>tr>td.cell-day>a", function(e){
			e.preventDefault();
			//#resultから今日のチェックを開く
			savedTurnId = turnId;
			savedDayId = dayId;
			setTurnId($(this).parents("tr").data("turn"));
			setDayId($(this).parents("tr").data("day"));
			openModal("modal-todayscheck");
		});
		$(document).on("click", ".result-unit>table>tbody>tr>td.cell-edit>a", function(e){
			//ターンとDAYを設定
			setTurnId($(this).parents("tr").data("turn"));
			setDayId($(this).parents("tr").data("day"));
			//モードを変更
			switchMode("main");
			//ホーム画面表示更新
			updateHomeScreen();
		});
		//#modal-howtoの「このサイトについて」ボタン
		$("#modal-howto .btn-about").on("click", function(e){
			e.preventDefault();
			//「ページの使い方」コンテンツ消去
			hideModalContent("modal-aboutsite");
		});
		//#modal-aboutsiteの閉じるボタン
		$("#modal-aboutsite .btn-close").on("click", function(e){
			e.preventDefault();
			closeModal();
		});

		//トラッキングリンク設定
		$("#tracking-links a").on("click", function(e){
			e.preventDefault();
		});
	}

	//START画面表示
	function showStartScreen(){
		console.log("showStartScreen");

		openModal("modal-start");
		//ボタン類設定
		$("#modal-start button").on("click", function(){
			//START画面消去
			hideStartScreen();
		});
	}

	//START画面消去
	function hideStartScreen(){
		console.log("hideStartScreen");
		//モーダル消去
		closeModal();
		//初期データ作成
		createInitialData();
		//ターンデータ新規作成
		addTurnData();
		//DAYデータ新規作成
		addDayData(0);
		//データ更新
		updateData();
		//変数更新
		updateVars();
		//ホーム画面表示更新
		updateHomeScreen();
	}

	//初期データ作成
	function createInitialData(){
		console.log("createInitialData");
		json = {};
		//コースとレベルを取得
		json.cs = cs;
		json.lv = lv;
		//値の初期化
		json.tf = json.te = 0;
		json.tn = [];
		json.ga = 0;
		json.ph = 3;
		json.pm = 0;
		json.updated = 0;
	}

	//ターンデータ新規作成
	function addTurnData(){
		//現在時刻取得
		updateMmtNow();
		//ターンCookie名生成・記録
		tnCookieName = "tn" + json.tn.length;
		console.log("addTurnData", tnCookieName);
		json.tn.push(tnCookieName);
		//ターンCookieの初期化＆保存
		tnCookies[tnCookieName] = {
			y: mmtNowBegin.year(),
			m: mmtNowBegin.month(),
			d: mmtNowBegin.date(),
			s:0,
			r:0,
			c:0,
			l:[]
		};
		//実行中ターンの最新日をセット
		setMmtFirst(mmtNowBegin.year(), mmtNowBegin.month(), mmtNowBegin.date());
		//変数更新
		setTurnId(json.tn.length - 1);
	}

	//DAYデータ新規作成
	function addDayData(tId){
		console.log("addDayData", tId);
		oTurn = tnCookies[json.tn[tId]];
		oTurn.l.push({
			f:0,
			e:0,
			y:0,
			j:0,
			b:0,
			s:0
		});
		//変数更新
		setDayId(oTurn.l.length - 1);
	}

	//データ更新
	function updateData(){
		console.log("updateData");
		var hasCompleted;
		//評価更新
		for(i=0;i<json.tn.length;i++){
			o = tnCookies[json.tn[i]];
			hasCompleted = true;
			//各DAYの評価
			for(ii=0;ii<o.l.length;ii++){
				val = 0;
				d = o.l[ii];
				if(parseInt(d.f) > 0){
					val++;
				}
				if(parseInt(d.e) > 0){
					val++;
				}
				if(parseInt(d.y) > 0){
					val++;
				}
				if(parseInt(d.j) > 0){
					val++;
				}
				d.s = val;
				//もしひとつもチェックされていない日があったらコンプリートフラグを下ろす
				if(val == 0){
					hasCompleted = false;
				}
			}
			//各ターンの評価
			o.r = 0;	//現状は意味ナシ

			console.log("CHECK", o.l.length, dayPerTurn, hasCompleted);

			//コンプリートフラグが立っていて、かつCookieに未記録であったら記録する
			if((o.l.length == dayPerTurn) && hasCompleted && (o.c == 0)){
				o.c = 1;
				//トラッキングコード送出
				console.log("コンプリートトラッキングコード送出");
				ga('send', 'event', '14days', '14days-access', '14days-complete');
				//console.log('send', 'event', '14days', '14days-access', '14days-complete');
				//$("a#complete-tracker").trigger("click");
			}
		}
		//処理中のjsonオブジェクトの更新日と実際のCookieの更新日が一致しない場合はリロードを喚起
		checkCookieUpdate();

		//更新日記録
		json.updated = new Date().getTime();
		//Cookie更新
		console.log("Cookies.set", "json", json);
		Cookies.set("json", json, {expires: 365 * 5, path: "/14dayschallenge/app/"});
		for(i=0;i<json.tn.length;i++){
			console.log("Cookies.set", json.tn[i]);
			Cookies.set(json.tn[i], tnCookies[json.tn[i]], {expires: 365 * 5, path: "/14dayschallenge/app/"});
		}
	}

	//変数更新
	function updateVars(){
		console.log("updateVars");
		//総ターン数を取得
		numTurn = json.tn.length;
	}

	//ホーム画面表示更新
	function updateHomeScreen(){
		console.log("updateHomeScreen", turnId, dayId);

		//ホーム画面表示ステータス更新
		isHome = true;

		//現在時刻更新
		updateMmtNow();

		//----------
		// 日またぎ処理
		//----------
		//日またぎ処理監視タイマースタート
		if(! oTimer){
			console.log("日またぎ処理監視タイマースタート");
			oTimer = setInterval(function(){
				checkDate();
			}, timerInterval);
		}
		//日またぎ処理実行
		checkDate();

		//----------
		// #day-indicator処理
		//----------
		//DAYの状態に応じてクラス付与
		var len = oTurn.l.length;
		$("#day-indicator>ul>li").each(function(i){
			//一旦クラスをリセット
			$(this).removeClass();
			//指定DAYチェック
			if(i == dayId){
				//指定DAYだったら.onクラスを付与
				$(this).addClass("on");
			}
			//today or doneチェック
			if((turnId == (numTurn - 1))&&(i == (len - 1))){
				//最新ターンの最新DAYだったら.todayクラスを付与
				$(this).addClass("today");
			}else if(i < len){
				//過去DAYだったら.doneクラスを付与
				$(this).addClass("done");
			}
		});
		//適切な位置へ移動

		var pos = 0, scrollMax = $("#day-indicator>ul").width() - $(window).width(), scrollUnit = $(window).width() / 5;
		switch(dayId){
			case 0:
			case 1:
			case 2:
				pos = 0;
				break;
			case 11:
			case 12:
			case 13:
				pos = scrollMax;
				break;
			default:
				pos = scrollUnit * (dayId - 2) + 1;
				break;
		}
		$("#day-indicator").stop().animate({
			scrollLeft: pos
		}, "fast");

		//----------
		// #menuチェック処理
		//----------
		//チェック状態をクリア
		$("#menu>ul>li.done").removeClass("done");
		//チェック状態を反映
		if(oDay.f > 0){
			$("#menu-food").addClass("done");
		}
		if(oDay.e > 0){
			$("#menu-exercise").addClass("done");
		}
		if(oDay.y > 0){
			$("#menu-yogurt").addClass("done");
		}
		if(oDay.j > 0){
			$("#menu-jikkan").addClass("done");
		}
		if(oDay.b > 0){
			$("#menu-bowel").addClass("done");
		}

	}

	//MENU実行
	function openMenu(mId){
		console.log("openMenu", mId);
		//
		var $advDiv, pos;
		updateMmtNow();
		//MENU開扉時の時刻を保存
		mmtMenuOpen = mmtNowBegin.clone();
		switch(mId){
			//「FOOD」「YOGURT」「JIKKAN」処理
			case "food":
			case "yogurt":
			case "jikkan":
				mmtAdviceLastOpened = moment.unix(json.tf);
				//ボタンの最後の押下から所定の時間が経過しているか？
				if(mmtNow.diff(mmtAdviceLastOpened, "hours") >= advicePeriod){
					//アドバイス画面表示
					openModal("modal-advice-food");
					//アドバイスランダム表示
					$advDiv = $("#modal-advice-food-" + cs);
					pos = Math.floor(Math.random() * $advDiv.children("dl").length);
					$advDiv.children("dl").eq(pos).appendTo($advDiv);
					//閉じるボタン設定
					$("#modal-advice-food a.btn-close").data("nextContent", "modal-" + mId);
					//データ更新
					json.tf = mmtNow.unix();
					updateData();
				}else{
					//MENUコンテンツ表示
					openModal("modal-" + mId);
				}
				break;
			//「EXERCISE」処理
			case "exercise":
				mmtAdviceLastOpened = moment.unix(json.te);
				//ボタンの最後の押下から所定の時間が経過しているか？
				if(mmtNow.diff(mmtAdviceLastOpened, "hours") >= advicePeriod){
					//アドバイス画面表示
					openModal("modal-advice-exercise");
					//アドバイスランダム表示
					$advDiv = $("#modal-advice-exercise>div");
					pos = Math.floor(Math.random() * $advDiv.children("dl").length);
					$advDiv.children("dl").eq(pos).appendTo($advDiv);
					//閉じるボタン設定
					$("#modal-advice-exercise a.btn-close").data("nextContent", "modal-" + mId);
					//データ更新
					json.te = mmtNow.unix();
					updateData();
				}else{
					//MENUコンテンツ表示
					openModal("modal-" + mId);
				}
				break;
			//「お通じ」処理
			case "bowel":
				//MENUコンテンツ表示
				openModal("modal-" + mId);
				break;
		}
	}

	//MENU終了
	function closeMenu(){
		console.log("closeMenu");
		/*
		switch($(".modal-checksheet.visible").attr("id")){
			case "modal-food":
				break;
			case "modal-yogurt":
				break;
			case "modal-exercise":
				break;
			case "modal-jikkan":
				break;
			case "modal-bowel":
				break;

		}
		*/
		//データ更新
		//updateData();
		//モーダル消去
		closeModal();
		//現在時刻取得
		//updateMmtNow();
		//mmtNow = moment().add(15,"days");
		//データ上の最新ターンの最新データの日付と現在の日付との差異を取得
		//diff = mmtNowBegin.diff(moment(mmtFirst).add(oTurn.l.length - 1, "days"), "days");
		//ホーム画面表示更新
		updateHomeScreen();
	}

	//モーダルオーバーレイ表示
	function openModal(contentId){
		console.log("openModal", contentId);
		$("body").addClass("modal-open");
		//ホーム画面表示ステータス更新
		isHome = false;
		$("#modal")
			.removeClass()
			.addClass(contentId)
			.stop()
			.fadeIn()
			.scrollTop(0);
		showModalContent(contentId);
	}

	//モーダルオーバーレイ消去
	function closeModal(){
		console.log("closeModal");
		//変数が保持されていた場合に更新
		if(savedTurnId != undefined){
			setTurnId(savedTurnId);
			setDayId(savedDayId);
			savedTurnId = savedDayId = undefined;
		}
		//消去
		$("#modal").stop().fadeOut(function(){
			$("body").removeClass("modal-open");
			$("#modal").removeClass();
			$("#modal .visible").removeClass("visible");
		});
	}

	//モーダルコンテンツ表示
	function showModalContent(mId){
		console.log("showModalContent", mId);
		//#modalにクラス指定
		if(! $("#modal").is("." + mId)){
			$("#modal").addClass(mId);
		}
		//指定コンテンツ表示
		if($("#modal>.visible").length > 0){
			$("#modal>.visible").removeClass("visible").delay(340).queue(function(){
				$("#"+mId).addClass("visible");
				//指定コンテンツ初期化
				initModalContent();
			});
		}else{
			$("#"+mId).addClass("visible");
			//指定コンテンツ初期化
			initModalContent();
		}
	}

	//モーダルコンテンツ消去
	function hideModalContent(nextId){
		console.log("hideModalContent", nextId);
		$("#modal>.visible").removeClass("visible");
		setTimeout(function(){
			//#modalのクラス削除
			$("#modal").removeClass();
			//指定コンテンツ表示
			showModalContent(nextId);
		}, 340);
	}

	//モーダルコンテンツ初期化
	function initModalContent(){
		console.log("initModalContent", $("#modal .visible").attr("id"));

		//データの値を反映
		switch($("#modal .visible").attr("id")){
			case "modal-food":
				arrFood = dec2arr(oDay.f, 15, 2, true);
				$.each(arrFood, function(i){
					if(this == 1){
						$("[name='check-food'][value='"+i+"']").prop("checked", true);
					}else{
						$("[name='check-food'][value='"+i+"']").prop("checked", false);
					}
				});
				break;
			case "modal-exercise":
				arrExercise = dec2arr(oDay.e, 15, 2, true);
				$.each(arrExercise, function(i){
					if(this == 1){
						$("[name='check-exercise'][value='"+i+"']").prop("checked", true);
					}else{
						$("[name='check-exercise'][value='"+i+"']").prop("checked", false);
					}
				});
				break;
			case "modal-yogurt":
				$("[name='check-yogurt']").each(function(i){
					$(this).prop("checked", (i < oDay.y));
				});
				break;
			case "modal-jikkan":
				$("[name='check-jikkan']").each(function(i){
					$(this).prop("checked", (parseInt($(this).prop("value")) == oDay.j));
				});
				break;
			case "modal-bowel":
				console.log(oDay.b);
				if(oDay.b == 1){
					//$("[name='check-bowel'][value='0']]").prop("checked", false);
					$("[name='check-bowel'][value='1']").prop("checked", true);
				}else{
					$("[name='check-bowel'][value='0']").prop("checked", true);
					//$("[name='check-bowel'][value='1]]").prop("checked", false);
				}
				break;
			case "modal-todayscheck":
				val = 0;
				//チェックマーク
				$("#modal-todayscheck .menus td").removeClass("checked");
				if(oDay.f > 0){
					$("#modal-todayscheck .menus td.food").addClass("checked");
					val++;
				}
				if(oDay.e > 0){
					$("#modal-todayscheck .menus td.exercise").addClass("checked");
					val++;
				}
				if(oDay.y > 0){
					$("#modal-todayscheck .menus td.yogurt").addClass("checked");
					val++;
				}
				if(oDay.j > 0){
					$("#modal-todayscheck .menus td.jikkan").addClass("checked");
					val++;
				}
				if(oDay.b > 0){
					$("#modal-todayscheck .menus td.bowel").addClass("checked");
				}
				//プログラムコンプリート度
				$("#modal-todayscheck .complete td dl").removeClass("show");
				$("#modal-todayscheck .complete td dl.status-" + val).addClass("show");
				break;
			case "modal-aboutsite":
				$("#modal").scrollTop(0);
				break;
		}
		//リサイズイベント発生
		$(window).trigger("resize");
	}

	//フォーム値変更ハンドラ
	function onFormChange(e){
		console.log("onFormChange");
		var $elem = $(e.target);
		switch($elem.prop("name")){
			case "check-food":
				//チェック内容を配列化
				arrFood = dec2arr(oDay.f, 15, 2, true);
				for(i=0;i<arrFood.length;i++){
					arrFood[i] = ($("[name='check-food'][value='"+i+"']").prop("checked"))?1:0;
				}
				//jsonに記録
				oDay.f = arr2dec(arrFood,2);
				break;
			case "check-exercise":
				//チェック内容を配列化
				arrExercise = dec2arr(oDay.e, 15, 2, true);
				for(i=0;i<arrExercise.length;i++){
					arrExercise[i] = ($("[name='check-exercise'][value='"+i+"']").prop("checked"))?1:0;
				}
				//jsonに記録
				oDay.e = arr2dec(arrExercise,2);
				break;
			case "check-yogurt":
				//jsonに記録
				oDay.y = $("[name='check-yogurt']:checked").length;
				break;
			case "check-bowel":
				//jsonに記録
				oDay.b = $("[name='check-bowel']:checked").val();
				break;
			case "check-jikkan":
				//jsonに記録
				oDay.j = $("[name='check-jikkan']:checked").val();
				break;
		}
		//データ更新
		updateData();
	}

	//リサイズハンドラ
	function onResize(){
		var iH = window.innerHeight;
		var modalPaddingH = 13 * 2;

		//モーダル：チェックシートの高さ（FOOD、EXERCISE）
		$(".modal-open .modal-checksheet").each(function(i){
			if($(this).css("display") == "block"){
				var sheetH = iH - modalPaddingH - ($(this).outerHeight() - $(this).find(".checksheet>.fit-height").height());
				$(this).find(".checksheet>.fit-height").height(sheetH);
			}
		});

	}

	//モード変更
	function switchMode(mode){
		console.log("switchMode", mode);
		switch(mode){
			case "main":
				//変数更新
				currentMode = "main";
				isHome = true;
				//領域の表示
				$("#main").slideDown();
				$("#result").slideUp();
				$("body").animate({
					"scrollTop" : 0
				}, "normal", function(){
					clearResult();
				});
				break;
			case "result":
				//変数更新
				currentMode = "result";
				isHome = false;
				//領域の表示
				$("#main").slideUp();
				$("#result").slideDown();
				$("body").animate({
					"scrollTop" : 0
				}, "normal");
				//表示の更新
				updateResult();
				break;
		}
	}

	//#result更新
	function updateResult(){
		console.log("updateResult");
		var $unit, $tr;
		//表示のクリア
		clearResult();
		//ターン分複製
		for(i=0;i<json.tn.length;i++){
			o = tnCookies[json.tn[i]];
			$unit = $("#result-unit-container>.result-unit-original").clone(true).removeClass("result-unit-original").addClass("result-unit");
			$unit.prependTo("#result-unit-container").addClass("result-" + i);
			//見出し
			if(i == (json.tn.length - 1)){
				$unit.find("h3").text("今回のチャレンジ結果");
			}else{
				$unit.find("h3").text((i+1) + "回目のチャレンジ結果");
			}
			//行複製＆データ反映
			for(ii=0;ii<o.l.length;ii++){
				d = o.l[ii];
				//行複製
				$tr = $unit.find("tbody>tr.original").clone(true).removeClass("original");
				$tr.appendTo($unit.find("table>tbody"));
				$tr.data({
					turn: i,
					day: ii
				});
				//DAY記述
				$tr.find(".cell-day>a").text((ii+1));
				//コンプリート度
				$tr.find(".cell-check").addClass("status-" + d.s);
				//お通じ
				if(d.b > 0){
					$tr.find(".cell-bowel").addClass("checked");
				}
			}
			//各ターンの評価
			o.r = 0;	//現状は意味ナシ
		}

	}

	//#resultクリア
	function clearResult(){
		console.log("clearResult")
		$(".result-unit").remove();
	}

	//#resultから今日のチェックを開く

	//#resultから編集画面を開く

	//Cookieのクリア
	function clearAllCookies(){
		console.log("clearAllCookies");
		//クリア時点での最新のCookieを取得
		var currentJson = Cookies.getJSON("json");
		//ターンCookieのクリア
		for(i=0;i<currentJson.tn.length;i++){
			Cookies.remove(currentJson.tn[i], {path: "/14dayschallenge/app/"});
		}
		//ベースCookieのクリア
		Cookies.remove("json", {path: "/14dayschallenge/app/"});
	}

	//mmtNowの更新
	function updateMmtNow(){
		var mmtDiff;
		mmtNow = moment();
		mmtNowBegin = moment({
			"year": mmtNow.year(),
			"month": mmtNow.month(),
			"date": mmtNow.date(),
			"hour": dailyPeriod[0],
			"minute": dailyPeriod[1],
			"second": 0,
			"millisecond": 0
		});

		if(mmtNow.isBefore(mmtNowBegin)){
			//区切り時間到達前であれば当該日の開始時刻は前日の同時刻
			mmtNowBegin.subtract(1,"days");
		}
		console.log("updateMmtNow", mmtNow.format(), mmtNowBegin.format(), dailyPeriod);
	}

	//mmtFirstのセット
	function setMmtFirst(y,m,d){
		mmtFirst = moment({
			"year": y,
			"month": m,
			"date": d,
			"hour": dailyPeriod[0],
			"minute": dailyPeriod[1],
			"second": 0,
			"millisecond": 0
		});
	}

	//日またぎ処理
	function checkDate(){
		console.log("checkDate");
		//処理中のjsonオブジェクトの更新日と実際のCookieの更新日が一致しない場合はリロードを喚起
		checkCookieUpdate();
		//ホーム画面表示中であればひまたぎ処理実行
		if(isHome){
			//現在時刻更新
			updateMmtNow();
			//現在表示中のターンはCookie上の最新ターンか？
			if(turnId == (json.tn.length - 1)){
				console.log("日またぎ処理：現在表示中のターンはCookie上の最新ターン");
				console.log("mmtNowBegin", mmtNowBegin.format());
				console.log("mmtFirst", mmtFirst.format());

				//Cookie上の実行中ターンの最新日と現在日付の差を取得
				diff = mmtNowBegin.diff(moment(mmtFirst).add(oTurn.l.length - 1, "days"), "days");
				//Cookie上の実行中ターンの初日と現在日付の差を取得
				diffB = mmtNowBegin.diff(mmtFirst, "days");
				//現在のターンの最新DAYと、現在時刻（の基準日）は一致するか？
				if((diff == 0) && (diffB < dayPerTurn)){
					console.log("日またぎ処理：現在のターンの最新DAYと、現在時刻（の基準日）は一致→日またぎ処理なし");
				}else{
					console.log("日またぎ処理：現在のターンの最新DAYと、現在時刻（の基準日）は不一致");



					//Cookie上の最新日と現在日付の差が13日以内か？
					if((diff < dayPerTurn) && (diffB < dayPerTurn)){
						console.log("Cookie上の最新日と現在日付の差：13日以内");
						//Cookie上の最新日と現在日付の間の空白日付分のダミーデータを作成
						for(i=0;i<diff;i++){
							//DAYデータ新規作成
							addDayData(turnId);
						}
						//データ更新
						updateData();
						//変数更新
						updateVars();
					}else{
						console.log("Cookie上の最新日と現在日付の差：14日以上");
						//Cookie上の実行中のターンの記録を「終了」に変更
						oTurn.s = 1;
						//新ターンデータ作成
						addTurnData();
						//DAYデータ新規作成
						addDayData(json.tn.length - 1);
						//データ更新
						updateData();
						//変数更新
						updateVars();
					}
					//ホーム画面表示更新
					updateHomeScreen();
				}
			}else{
				console.log("日またぎ処理：現在表示中のターンはCookie上の最新ターンではない→日またぎ処理なし");
			}
		}
	}

	//Cookieが裏で更新された場合のリロード喚起処理
	function checkCookieUpdate(){
		console.log("checkCookieUpdate");
		var presentJSON = Cookies.getJSON("json");
		if(presentJSON != undefined){
			if((presentJSON.updated != undefined) && (json.updated != undefined) &&(presentJSON.updated != json.updated)){
				var reload = confirm("Cookieのデータが裏で更新されました。閲覧中のページを再読込して更新されたデータを反映してください。閲覧中のページを再読込しますか？");
				if(reload){
					location.href = (location.protocol + "//" + location.host + location.pathname + "?course=" + presentJSON.cs + presentJSON.lv);
				}
			}
		}
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
//10進数の数値をn進数表記の配列（最低digit桁の）に変換
//※convオプションをtrueにすると数値として配列に格納
function dec2arr(val, digit, n, conv){
	var a, i, d;
	if(!n){
		n = 2;
	}
	a = val.toString(n).split("");
	if(a.length < digit){
		d = digit - a.length;
		for(i=0;i<d;i++){
			a.unshift("0");
		}
	}
	if(conv){
		for(i=0;i<a.length;i++){
			a[i] = parseInt(a[i]);
		}
	}else{
		a = a.join("");
	}
	return a;
}
//n進数表記の配列を10進数の数値に変換
function arr2dec(arr, n){
	if(!n){
		n = 2;
	}
	return parseInt(arr.join(""),n);
}
