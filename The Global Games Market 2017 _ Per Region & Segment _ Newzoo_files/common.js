$ = jQuery;

/**
 * Generic modal function
 */

function displayModal(title, body, selector) {

	 if(!$('.'+selector).length) {
		$('body').append('<div class="alert '+selector+'"><div class="alert-top">'+title+'</div><div class="alert-body">'+body+'</div><div class="alert-actions"><a class="button green">OK</a></div></div>');
	 }
}

function toggleModal(selector, boolOverlay) {
	$(selector).fadeIn('fast');
	if(boolOverlay) {
		$('.overlay.generic').fadeIn('fast');
	}
}

$(document).ready(function() {
	$(document).on('change.selectChange','.rankingselect',function() {

		var selected = $('.rankingselect').find('option:selected');

		var customFiltering = [];
		if($('.custom-filter').length) {

			$('.custom-filter').each(function() {
				customFiltering.push($(this).attr('data-controller')+'|'+$(this).val());
			});
		}


		$.ajax({
			url: window.sitePath+'/wp-admin/admin-ajax.php',
			beforeSend: function() {
				$('.overlay1').fadeIn(200);
				//$('.output').empty();
			},
			type: 'post',
			data: {'action': 'getranking', 'rankingyear': selected.data('year'), 'rankingmonth': selected.data('month'), 'RankingID': $('.rankingselect').attr('data-id'), 'customFilters': customFiltering.join(','), 'customRankChange': $('.rankingselect').attr('data-custom-change') },
			success: function(data, status) {
				$('.output').empty();
				$('.output').show();
				$('.output').append(data);
				$('.first').remove();
				$('.overlay1').hide();
			},
			error: function(xhr, desc, err) {
				console.log(xhr);
				console.log("Details: " + desc + "\nError:" + err);
			}
		}); // end ajax call
	});
});

/**
 * NAvigation Dropdown
 */

 $( ".main-menu li" ).hover(
   function() {
     $( this ).addClass( "hover" );
   }, function() {
     $( this ).removeClass( "hover" );
   }
 );

/**
 * WishList
 */

 $('.wishlist-trigger').click(function(e) {
	e.preventDefault();

	$(this).removeClass('visible');
	$('.wishlist').addClass('visible');

 });

 $('a.wishlist-minimize').click(function(e) {
	e.preventDefault();

	$('.wishlist').removeClass('visible');
	setTimeout(function() { $('.wishlist-trigger').addClass('visible') }, 200);

 });

 $('.button-add-to-wishlist').click(function(e) {
	e.preventDefault();

	var selectedSegments = [];
	var selectedCountries = [];
	var boolBasic = "false";
	var boolPremium = "false";
	var _productID = $(this).attr('data-product');
	var _this = $(this);
	var _cart = $('.wishlist-body');
	var _counter = $('.wishlist-count span');

	if($(this).attr('data-isbasic') === "true") {
		boolBasic = "true";
	}

	if($(this).attr('data-ispremium') === "true") {
		boolPremium = "true";
	}

	if($(this).attr('data-allow-segment-customization') === "1") {
		$('.product-segments input[type="checkbox"]:checked').each(function() {
			selectedSegments.push($(this).val());
		});

		if(!$('.product-segments input[type="checkbox"]:checked').length) {
			displayModal('Could not add to wishlist','Sorry, we need a bit more information. Please add at least one segment and country by checking the boxes in front.', 'alert-variations-required');
		}
	}

	if($(this).attr('data-allow-country-customization') === "1") {
		$('.product-countries input[type="checkbox"]:checked').each(function() {
			selectedCountries.push($(this).val());
		});

		if(!$('.product-countries input[type="checkbox"]:checked').length) {
			displayModal('Could not add to wishlist','Sorry, we need a bit more information. Please add at least one segment and country by checking the boxes in front.', 'alert-variations-required');
		}
	}

	var cartManifest = '{"manifest":[{"operatingmode":"wishList","product":"'+_productID+'", "variants":[{"segments":"'+selectedSegments.join(', ')+'", "countries":"'+selectedCountries.join(', ')+'", "basic":"'+boolBasic+'", "premium":"'+boolPremium+'"}]}]}';

	if(!$('.alert-variations-required').length) {
		$.ajax({
			url: window.sitePath+'/wp-admin/admin-ajax.php',
			dataType: 'JSON',
			type: 'POST',
			data: {'action':'cart_action', 'manifest': encodeURI(cartManifest)},
			beforeSend: function() { _this.addClass('processing'); },
			success: function() {

				/**
				 * Send again, to read out cookie and validate.
				 */

				$.ajax({
					url: window.sitePath+'/wp-admin/admin-ajax.php',
					dataType: 'JSON',
					type: 'POST',
					data: {'action':'cart_action', 'manifest': encodeURI(cartManifest)},
					beforeSend: function() { _this.addClass('processing'); },
					success: function(data) {
						_this.removeClass('processing');

						if(parseInt(data.count) > 0) {
							$('.wishlist').addClass('visible');
							$('.wishlist-trigger').removeClass('visible');
						}

						setTimeout(function() { var uniqueID = Math.ceil(Math.random() * 10);
							$('body').append('<span class="generated-product" id="'+uniqueID+'" style="position: absolute; top: '+e.pageY+'px; left: '+e.pageX+'px; background-color: '+_this.attr('data-color')+';"></span>');
							$('#'+uniqueID).fadeIn('fast').css({'opacity': 1, 'top': $('.wishlist .wishlist-top').offset().top, 'left': $('.wishlist .wishlist-top').offset().left});

							setTimeout(function() { $('#'+uniqueID).css({'opacity': 0}); }, 600);
						}, 400);

						_cart.empty().html(data.html);
						_counter.html(data.count);

						setTimeout(function() {

							$('.wishlist').removeClass('visible');
							setTimeout(function() { $('.wishlist-trigger').addClass('visible') }, 200);

						}, 6500)

					}
				});
			}
		});

	}

 });

 $(document).on('click.removeItem', 'a.remove-product', function() {

	var _this = $(this);
	var _cart = $('.wishlist-body');
	var _counter = $('.wishlist-count span');
	var _productID = $(this).data('product');
	var cartManifest = '{"manifest":[{"operatingmode":"delete","product":"'+_productID+'", "variants":[{"segments":"", "countries":""}]}]}';

	$.ajax({
		url: window.sitePath+'/wp-admin/admin-ajax.php',
		dataType: 'JSON',
		type: 'POST',
		data: {'action':'cart_action', 'manifest': encodeURI(cartManifest)},
		beforeSend: function() { _this.addClass('processing'); },
		success: function() {

			/**
			 * Send again, to read out cookie and validate.
			 */

			$.ajax({
				url: window.sitePath+'/wp-admin/admin-ajax.php',
				dataType: 'JSON',
				type: 'POST',
				data: {'action':'cart_action', 'manifest': encodeURI(cartManifest)},
				beforeSend: function() { _this.addClass('processing'); },
				success: function(data) {

					if(parseInt(data.count) < 1) {
						$('.wishlist').removeClass('visible');
					}

					_cart.empty().html(data.html);
					_counter.html(data.count);

					$('[data-product="'+_productID+'"]').remove();
				}
		    });
		}
	});

 });

 $(document).on('click.closeModal', '.alert-actions a.button', function() {
	$(this).parent().parent().remove();
 });


 /**
  * Hide tag load more if all tags are visible.
  */

 if($('.tags ul').length) {
	 if($('.tags ul').height() >= $('.tags ul')[0].scrollHeight) {
		$('.tags a.load-more').hide();
	 }
 }

 $('.tags a.load-more').click(function(e) {
	 e.preventDefault();

	 var _html = $(this).html();
	 var _count = _html.split('<span>');

	 if($(this).parent().find('ul').hasClass('open')) {
		 $(this).parent().find('ul').animate({'height': '48px'}, 500, '').removeClass('open');
		 $(this).html('Show all tags <span>'+_count[1]);

	 } else {
		 var lastTagOffset = $(this).parent().find('ul')[0].scrollHeight;
		 $(this).parent().find('ul').animate({'height': lastTagOffset+'px'}, 500, '').addClass('open');
		 $(this).html('Show less tags <span>'+_count[1]);
	 }

	 $(this).toggleClass('clicked');
 });

 /**
  * Tag filtering
  */

  window.currentPageIndex = 1;

  $('[data-allowfiltering] ul li a').click(function(e) {
    	e.preventDefault();

    	var _selectedTags = [];
    	var _container = $('.'+$('[data-allowfiltering]').attr('data-container'));

		if(!$(this).hasClass('active')) {
			$(this).addClass('processing');
			if($('li.active').length) {
				$(this).addClass('active').attr('data-returnpos', $(this).parent().index()).parent().insertAfter($(this).parent().parent().find('li[class="active"]:last')).addClass('active');
			} else {
				$(this).addClass('active').attr('data-returnpos', $(this).parent().index()).parent().addClass('active').insertBefore($(this).parent().parent().find('li:first-of-type'));
			}

		} else {
		  	$(this).removeClass('active').parent().removeClass('active').insertAfter($(this).parent().parent().find('li:nth('+($(this).attr('data-returnpos'))+')'));
	  	}

	  	if($('[data-allowfiltering] a.active').length) {
			$('[data-allowfiltering] a.active').each(function() {
				_selectedTags.push($(this).attr('data-tag')+'|'+$(this).attr('data-type'));
			});
			_selectedTags = _selectedTags.join(',');
		} else {
			_selectedTags = "";
		}

		window.currentPageIndex = 1;


	  	$.ajax({
			url: window.sitePath+'/wp-admin/admin-ajax.php',
			type: 'POST',
			dataType: 'JSON',
			data: {'action':'autoLoad', 'type':$('[data-allowfiltering]').attr('data-posttype'), 'page':window.currentPageIndex, 'tags':_selectedTags, 'perpage': $('[data-perpage]').attr('data-perpage')},
			beforeSend: function() { _container.append('<div class="ajaxarea-processing"></div>').find('.ajaxarea-processing').fadeIn(); },
			success: function(data) {
				_container.find('.container, .banner, .ajaxarea-processing').remove();
				$(data.html).insertBefore(_container.find('.fetch-posts'));
				$('a.active').removeClass('processing');

				if($('a.active').length) {
					$('.tags ul li a').hide();
					$.each(data.allowedtags, function(i, v) {
						$('[data-tag="'+v+'"]').show();
					});
				} else {
					$('.tags ul li a').show();
				}
			}
		});
  });

  /**
   * Load More
   */

   $(document).on('click.getMore', 'a.fetch-posts', function(e) {
	    e.preventDefault();

	    var _selectedTags = [];
    	var _container = $('.'+$('[data-allowfiltering]').attr('data-container'));
    	var _this = $(this);

	    $('[data-allowfiltering] a.active').each(function() {
			_selectedTags.push($(this).attr('data-tag')+'|'+$(this).attr('data-type'));
	    });


	    window.currentPageIndex++;
	    if(window.currentPageIndex <= $(this).attr('data-maxpages')) {

		    $.ajax({
				url: window.sitePath+'/wp-admin/admin-ajax.php',
				type: 'POST',
				dataType: 'JSON',
				data: {'action':'autoLoad', 'type':$('[data-allowfiltering]').attr('data-posttype'), 'page':window.currentPageIndex, 'tags':_selectedTags.join(','), 'perpage': $('[data-perpage]').attr('data-perpage')},
				beforeSend: function() {
					_this.addClass('processing');
				},
				success: function(data) {

					console.log(_container);
					console.log(data);
					
					if($('[data-allowfiltering]').hasClass('displaynone')) {
						_this.attr('data-maxpages', data.pages);
						_container.append(data.html);
					} else {
						_container.find('.container.flex:last').append(data.html);
					}
					$('a.active').removeClass('processing');
					_this.removeClass('processing');

					if(window.currentPageIndex == _this.attr('data-maxpages')) {
						_this.fadeOut();
					}
				}
			});

	    }
   });

   $('a.wltrigger').click(function(e) {
	  e.preventDefault();

	  var _this = $(this);

	  $('input.required').each(function() {
		 if(!$(this).val()) {
			 $(this).addClass('error');
		 }
	  });

	  var _userData = '"purchaser": [{"firstname":"'+$('[name="firstname"]').val()+'", "lastname":"'+$('[name="lastname"]').val()+'", "email":"'+$('[name="email"]').val()+'", "street":"'+$('[name="street"]').val()+'", "unit":"'+$('[name="unit"]').val()+'", "zip":"'+$('[name="zip"]').val()+'", "city":"'+$('[name="city"]').val()+'", "country":"'+$('[name="country"]').val()+'", "company":"'+$('[name="company"]').val()+'", "vat":"'+$('[name="vat"]').val()+'", "message":"'+$('[name="message"]').val()+'"}]';
	  var _productData = [];

	  $('.wishlist-contents ul li').each(function() {
		 _productData.push('"'+$(this).attr('data-product')+'": [{"variant":"'+$(this).attr('data-variant')+'", "countries":"'+$(this).attr('data-countries')+'", "segments":"'+$(this).attr('data-segments')+'"}]');
	  });

	  var _jsonManifest = '{"request": [{'+_userData+', "products": [{'+_productData.join(',')+'}]}]}';

	  if(!$('.error').length) {
		  $.ajax({
			 url: window.sitePath+'/wp-admin/admin-ajax.php',
			 type: 'POST',
			 dataType: 'JSON',
			 data: {'action':'request', 'manifest': _jsonManifest},
			 beforeSend: function() { _this.addClass('processing'); },
			 success: function(response) {
				 $('.wldataentry').hide();
				 $('.wlthanks').show();
				 $('.wishlist-contents a.remove-product').fadeOut();
			 }
		  });
	  }

   });

   $('.hbspt-form').on( 'click', 'input:checkbox', function () {
	   $( this ).parent().toggleClass( 'checked', this.checked );
	});

   $('.wlforms input.required').keyup(function(e) {
	  if($(this).val().length) {
		  $(this).removeClass('error');
	  } else {
		  $(this).addClass('error');
	  }
   });

   $('.button-buy').click(function(e) {
	  e.preventDefault();

	  var _productID = $(this).attr('data-product');
	  var _variant = $(this).attr('data-type');

	  /**
	   * Create form and submit
	   */

	  $('body').append('<form class="bform" action="/checkout/" method="post"><input type="hidden" name="productID" value="'+_productID+'"><input type="hidden" name="type" value="'+_variant+'"></form>');
	  $('.bform').submit();

   });

   /**
	* BRS @ 11 02 2016
	*/

	if(location.hash && $('[data-allowfiltering]').length) {
		$('[data-tag="'+location.hash.replace('#','')+'"]').click();
	}

	$('a.toggle-countries').click(function() {
		if($(this).hasClass('deselected')) {
			$(this).removeClass('deselected');
		} else {
			$(this).addClass('deselected');
		}

		$('.product-countries input[type="checkbox"]').click();
	});


	/**
	 * SexySearch
	 */

	var delaySearch = (function() {
    var timeOut = 0;
    return function(callback, ms) {
		clearTimeout (timeOut);
		timeOut = setTimeout(callback, ms);
	  };
	})();

    $('.search_field').keyup(function(e) {
        var _strVal = $(this).val();

	    if(e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13 && e.keyCode != 16 && e.keyCode != 17 && $('.search_field').val().length > 1) {
            delaySearch(function () {

				$.ajax({
					url: window.sitePath+'/wp-admin/admin-ajax.php',
					type: 'GET',
					dataType: 'JSON',
					data: {action:'search', s: _strVal},
					beforeSend: function() {
						$('.search_field').addClass('processing');
						$('.search_results').empty().addClass('processing');

						$('.no_results').hide();
					},
					success: function(result) {
						$('.search_results').fadeIn('fast');
						$('.search_results').empty();
						$('.search_field, .search_results').removeClass('processing');
						$('.search_results').append('<div class="section" data-contains="results"><ul></ul></div>');

						//ga('send', 'pageview', window.sitePath+'/wp-admin/admin-ajax.php?action=search&s='+_strVal);

						if(!result.tags.length && result.posts.articles == "" && result.posts.infographics == "" && result.posts.news == "" && result.posts.rankings == "" && result.posts.trendreports == "" && result.posts.solutions == "") {
							$('.no_results').text('Sorry, we could not find any content matching \''+_strVal+'\'. Please try again with another search phrase.').show();
							$('.search_results').hide();
						} else {
							$('.search_results').show();
                            $('.no_results').hide();
						}

						if(result.tags.length) {
							$('.search_results ul').append('<li class="ruler">Topic</li>');

							$.each(result.tags, function(key, val) {
								$('.search_results ul').append('<li class="result"><a href="'+val.link+'" title="'+val.title+'">'+val.title+'</a></li>');
							});
						}

						if(result.posts[0] != "") {
							$.each(result.posts, function(key, data) {

								if(data != "") {

									$('.search_results ul').append('<li class="ruler">'+key+'</li>');
									var _now = key;

									var _index = 0;
									var _bufferPool = []
									$.each(data, function(key, val) {

											if(_index < 11) {

												if(val.match == 'tag') {
													$('.search_results ul').append('<li class="result"><a href="'+val.link+'" title="'+val.title.replace('<b>','').replace('</b>','')+'">'+val.title+'</a><small>Tagged with <b>'+val.tagname+'</b></small></li>');
												} else {
													$('.search_results ul').append('<li class="result"><a href="'+val.link+'" title="'+val.title.replace('<b>','').replace('</b>','')+'">'+val.title+'</a></li>');
												}
											} else {

												if(val.match == 'tag') {
													_bufferPool.push({pushto: _now, html:'<li class="result"><a href="'+val.link+'" title="'+val.title.replace('<b>','').replace('</b>','')+'">'+val.title+'</a><small>Tagged with <b>'+val.tagname+'</b></small></li>'});
												} else {
													_bufferPool.push({pushto: _now, html:'<li class="result"><a href="'+val.link+'" title="'+val.title.replace('<b>','').replace('</b>','')+'">'+val.title+'</a></li>'});
												}


												if(!$('.ruler.more.'+_now).length) {
													$('.search_results ul').append('<li class="ruler more '+_now+'" data-for="'+_now+'"><a>Show all</a></li>');
												}

												window.bufferPool = _bufferPool;
											}

											_index++;
									});
								}
							});
						}

						$('.search_results li:nth-child(2)').addClass('selected');

						ga('send', 'pageview', window.sitePath+'/wp-admin/admin-ajax.php?action=search&s='+_strVal);

					}

				});

			}, 700);

		}

		else if (e.keyCode == 38) {

			e.preventDefault();

		    var _currentSelection = $(".search_results li.selected");
		    $(".search_results li").removeClass("selected");

		    if(_currentSelection.prevAll('.result').first().length) {
				_currentSelection.prevAll('.result').first().addClass("selected");
			} else {
				$(".search_results li.result:last").addClass('selected');
			}

			$('.search_results li.selected a').focus().blur();
			$('.search_field').focus();

		}

		else if (e.keyCode == 40) {

		    e.preventDefault();

		    var _currentSelection = $(".search_results li.selected");
		    $(".search_results li").removeClass("selected");

			if(_currentSelection.nextAll('.result').first().length) {
				_currentSelection.nextAll('.result').first().addClass("selected");
			} else {
				$(".search_results li.result:first").addClass('selected');
			}


	        $('.search_results li.selected a').focus().blur();
			$('.search_field').focus();

		}

		else if(e.keyCode == 13) {
			e.preventDefault();

			if($('.search_results li.selected').length) {
				location.href = $('.search_results li.selected a').attr('href');
			}
		}

	});

	$(document).on('click.allResults', '.ruler.more a', function(e) {

		e.preventDefault();
		var _for = $(this).parent().attr('data-for');

		$.each(window.bufferPool, function(key, val) {
			if(val.pushto == _for) {
				$(val.html).insertBefore('[data-for="'+_for+'"]');
			}

		});

		$('[data-for="'+_for+'"]').remove();

	});
