/**
 * Stripe Payment Processing
 */

function doOrderAjax() {
	var _userData = '"purchaser": [{"firstname":"'+$('[name="firstname"]').val()+'", "lastname":"'+$('[name="lastname"]').val()+'", "email":"'+$('[name="email"]').val()+'", "street":"'+$('[name="street"]').val()+'", "unit":"'+$('[name="unit"]').val()+'", "zip":"'+$('[name="zip"]').val()+'", "city":"'+$('[name="city"]').val()+'", "country":"'+$('[name="country"]').val()+'", "company":"'+$('[name="company"]').val()+'", "vat":"'+$('[name="vat"]').val()+'", "paymenttype":"'+$('[name="method"]:checked').val()+'"}]';
	var _productData = [];

	$('.wishlist-contents ul li').each(function() {
		 _productData.push('"type":"'+$(this).attr('data-type')+'", "product":"'+$(this).attr('data-product')+'"');
	});

	var _jsonManifest = '{"request": [{'+_userData+', "products": [{'+_productData.join(',')+'}], "token": "'+window.token+'"}]}';
	console.log(_jsonManifest);

	$.ajax({
		url: '/wp-admin/admin-ajax.php',
		type: 'POST',
		dataType: 'JSON',
		data: {'action':'order', 'manifest': _jsonManifest},
		success: function(response) {
			 if(response.message == "success") {
				 $('.bdataentry').hide();
				 $('.bthanks').show();

				 $('.processing-popup, .overlay.generic').fadeOut('fast');
			 } else {
				 $('.processing-popup a.cancelpayment').click();
				 displayModal('Sorry, something went wrong', 'An error occured whilst processing your payment, no bookings have been made to your card. Please try again.', 'popup');
			 }
		}
	});
}

$('[name="method"]').change(function() {

	if($('[name="method"]:checked').val() == "invoice") {
		$('.btrigger').text('Purchase');
	} else if($('[name="method"]:checked').val() == "preorder") {
		$('.btrigger').text('Pre-order');
	} else {
		$('.btrigger').text('Continue');
	}
})


$('.btrigger').click(function(e) {
	e.preventDefault();

	$('input.required').each(function() {
		 if(!$(this).val()) {
			 $(this).addClass('error');
		 }
	});

	if(!$('.error').length && $('[name="method"]:checked').val() == "card" && $("#terms").prop("checked") === true) {
		toggleModal('.payment.processing-popup.card', true);
	} else if(!$('.error').length && $('[name="method"]:checked').val() == "invoice" && $("#terms").prop("checked") === true) {
		window.token = "";
		doOrderAjax();
		$(this).addClass('processing');
	} else if(!$('.error').length && $('[name="method"]:checked').val() == "preorder" && $("#terms").prop("checked") === true) {
		window.token = "";
		doOrderAjax();
		$(this).addClass('processing');
	}
})


$('.stripepayment').click(function(e) {
	e.preventDefault();

	if(!$(this).hasClass('busy') && !$('.error').length) {
		$(this).addClass('busy').addClass('processing').text('Authenticating ... ').parent().find('.pdata').submit();
	}
});

$('a.cancelpayment').click(function(e) {
	e.preventDefault();

	$('.processing-popup, .overlay').fadeOut('fast').find('form input').val('');
	$('.stripepayment').removeClass('processing').removeClass('busy').text('Pay');
});

jQuery(function($) {

  $('.pdata').submit(function(event) {

    var $form = $(this);
    Stripe.card.createToken($form, stripeResponseHandler);
    return false;

  });
});

function stripeResponseHandler(status, response) {
  var $form = $('#payment-form');

  if (response.error) {

    $form.find('.payment-errors').text(response.error.message);
    $form.parent().find('a.button').removeClass('busy').removeClass('processing');

  } else {
    window.token = response.id;

	/**
	 * Go go gadget Ajax
 	 */

 	 doOrderAjax();

  }
};
