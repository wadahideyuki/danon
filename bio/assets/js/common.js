$(document).on('ready', function() {
      $(".main-slide").slick({
        dots: true,
        infinite: true,
      });
	
	
	/**lineupslide**/
      $(".lineup-slide").slick({
        dots: false,
        slidesToShow: 6,
        slidesToScroll: 6,
          responsive: [{
               breakpoint: 767,
                    settings: {
                         slidesToShow: 1,
                         slidesToScroll: 1,
               }
          }
          ]
      });
	
	
	/**headermenu**/
	$(".sp-menu-btn").click(function(){
		$("header nav,.sp-wrap").toggleClass("open");
//		console.log(winW)
	});
	var winW =$(window).width()
	$(window).resize(function(){
		 winW =$(window).width();
	});	
//	$("header").on("click"," nav.open li.has-menu > a",function(){
//		$(this).parents("li").toggleClass("open");
//		if(winW < 768){
//		return false;
//		}
//	});
	$(".sp-menu-close,.sp-wrap").click(function(){
		$("header nav,.sp-wrap").toggleClass("open");
	})


$(".about-nav li a").click(function(){
	var filter = $(this).attr("class").replace("nav", "");
	$(".about-list > li").hide();
	$(".about-list > li.filt" + filter).show();
	return false;
});
	
	///***footerlink**///
	var pageCategory = location.search;
	if(pageCategory == "?tikara"){
		$(".about-list > li").hide();
		$(".about-list > li.filtTikara").show();
	}
	if(pageCategory == "?campaign"){
		$(".lineup-list > li").hide();
		$(".about-list > li.filtCampaign").show();
	}
	if(pageCategory == "?oishisa"){
		$(".about-list > li").hide();
		$(".about-list > li.filtOisisa").show();
	}	
	if(pageCategory == "?drink"){
		$(".lineup-list > li").hide();
		$(".lineup-list > li.filtDrink").show();
	}
	if(pageCategory == "?plane"){
		$(".lineup-list > li").hide();
		$(".lineup-list > li.filtPlane").show();
	}
	if(pageCategory == "?fruits"){
		$(".lineup-list > li").hide();
		$(".lineup-list > li.filtFruits").show();
	}


});