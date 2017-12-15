;(function($) {
	$(function(){
		$(".modal-closer").on("click", function(e){
			$(".modal-launcher").modaal("close");
		});
		var $ulContainer  = $("<div id='table-ul'></div>");
		var $ul, $li;
		$ul = $("<ul></ul>");
		for(var i=0;i<3;i++){
			$li = $("<li></li>");
			var th = $(".table table>tbody>tr>th").eq(i).text();
			var td = $(".table table>tbody>tr>td").eq(i).text();
			$li.text(th + "：" + td);
			$ul.append($li);
		}
		$ulContainer.append($ul);
		$ul = $("<ul></ul>");
		for(var i=3;i<6;i++){
			$li = $("<li></li>");
			var th = $(".table table>tbody>tr>th").eq(i).text();
			var td = $(".table table>tbody>tr>td").eq(i).text();
			$li.text(th + "：" + td);
			$ul.append($li);
		}
		$ulContainer.append($ul);
		$(".modal-prod .table").append($ulContainer);
	});
})(jQuery);