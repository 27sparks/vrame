jQuery(function($) {
	
	/* Main Navigation */
	$('#nav').droppy({ speed: 0 });
	
	/* News flashes */
	$(".flash").click(function() {
		$(this).fadeOut();
	});
	
	/* Expandable sections */
	$(".expandable").click(function() {
		$($(this).attr("href")).slideToggle();
		return false;
	});
	
	/* Tooltips */
	$('.tooltip').tipsy({ gravity: 'w' });
	
	/* Adding of new meta information fields */
	$("#add-schema-item").populateRow("#schema-item-prototype", "#schema");
	$("#add-key-value").populateRow("#key-value-prototype", "#keys-values");
	
	/* Rich Text Editing Textareas */
	$(".rte-zone").rte({
		media_url : "/vrame/images/rte/",
		content_css_url: "/vrame/stylesheets/rte.css"
	});
	
	/* Date picker */
	if ($(".datepicker").size() > 0) {
		$(".datepicker").datepicker({
			duration: '',  
			showTime: true,  
			constrainInput: false
		});
	}
	
});

/* Asset list behavior */
jQuery(function ($) {
	
	var textareaSelector = "textarea[name=title]";
	
	$(".asset-list")
	
		.find("a.delete")
			.live("click", deleteAsset)
			.end()
			
		.find(".image-wrapper")
			.attr('title', 'Klicken zum Vergrößern')
			.live("click", loadFullview)
			.end()
			
		.find(textareaSelector)
			.live("keypress", saveTitle)
			.end()
		/* Event delegation with bubbling focusout */
		.bind("focusout", saveTitle)
		/* Event Delegation with capturing blur */
		.each(captureTextareaBlur);
	
	function deleteAsset (e) {
		e.preventDefault();
		
		if (!confirm('Wirklich löschen?')) {
			return false;
		}
		
		var deleteLink = $(this);
		
		/* Hide corresponding asset list item */
		deleteLink.parents("li:eq(0)").hide();
		
		/* Remove asset id from hidden input field */
		deleteLink.parents('div.file-upload:eq(0)').find('input.asset-id').val('');
		
		/* Send DELETE request */
		$.post(deleteLink.attr('href'), {
			_method: 'delete',
			authenticity_token: deleteLink.attr("data-authenticity-token")
		});
	}
	
	var image = $("<img>")
			.attr("id", "asset-fullview")
			.attr("title", "Vollansicht schließen")
			.click(hideFullview)
			.load(showFullview)
			.css("display", "none")
			.appendTo(document.body),
		wrapperWidth,
		wrapperHeight,
		wrapperOffset;
		
	function hideFullview () {
		image.css("display", "none");
	}
	
	function loadFullview () {
		var wrapper = jQuery(this),
			fullUrl = wrapper.attr("fullurl");
		if (!fullUrl) {
			return;
		}
		wrapperWidth = wrapper.width();
		wrapperHeight = wrapper.height();
		wrapperOffset = wrapper.offset();
		image.attr("src", fullUrl);
	}
	
	function showFullview () {
		image.css({
			left : Math.max(0, wrapperOffset.left - (image.attr("width") - wrapperWidth) / 2),
			top : Math.max(0, wrapperOffset.top - (image.attr("height") - wrapperHeight) / 2),
			display : "block"
		});
	}
	
	function captureTextareaBlur () {
		if (this.addEventListener) {
			this.addEventListener("blur", saveTitle, true);
		}
	}
	
	function saveTitle (e) {
		//console.log("saveTitle", e.type);
		var textarea = $(e.target),
			saveInterval,
			closure = function () {
				sendTitle(textarea);
			};
		if (!textarea.is(textareaSelector)) {
			return;
		}
		clearInterval(textarea.data("saveInterval"));
		if (e.type == "keypress") {
			saveInterval = setTimeout(closure, 2000);
			textarea.data("saveInterval", saveInterval);
		} else {
			closure();
		}
	}
	
	function sendTitle (textarea) {
		//console.log("sendTitle");
		var assetId = textarea.attr("data-asset-id");
		$.post(
			"/vrame/assets/" + assetId,
			{
				"asset[title]" : textarea.val(),
				"_method" : "put",
				"authenticity_token" : textarea.attr("data-authenticity-token")
			},
			function (responseData) {
				titleSent(responseData, textarea);
			}
		);
	}
	
	function titleSent (responseData, textarea) {
		//console.log("titleSent", responseData);
		textarea
			.css('backgroundColor', '#ffb')
			.animate({'backgroundColor' : '#fff'}, 800);
	}
	
});

/* Input field placeholder text */

jQuery(function ($) {
	$("input[type=text][placeholder], textarea[placeholder]").placeholder();
});

jQuery.fn.placeholder = function () {
	if (jQuery.fn.placeholder.supported) {
		return;
	}
	return this.each(function () {
		var field = jQuery(this),
			placeholder = field.attr('placeholder');
		
		if (!placeholder) {
			return;
		}
		
		field
			.blur(function () {
				var field = jQuery(this);
				if (field.val() == '') {
					field.val(placeholder);
				}
			})
			.focus(function () {
				var field = jQuery(this);
				if (field.val() == placeholder) {
					field.val('');
				}
			})
			.blur();
		
		jQuery(field.attr('form')).submit(function () {
			var field = jQuery(this);
			if (field.val() == placeholder) {
				field.val('');
			}
		});
	});
};

jQuery.fn.placeholder.supported = (function () {
	return typeof document.createElement('input').placeholder == 'string';
})();

/* Unsaved Alert */

jQuery(function() {
  if (typeof(vrame) == 'undefined') {vrame = {};}
  // Remember wether the current pages contains unsaved changes
  vrame.unsavedChanges = false;
  
  // Tell wether the content of the RTEs was changed
  var rtesChanged = function() {
    var changed = false;
    $("iframe").each(function(){
      var id = this.id;
      var content = $(this).contents().find("body").html();
      var textarea_content = $("textarea#"+ id).val();
      changed = changed || (content != textarea_content);
    })
    return changed;
  };
  
  var onBeforeUnloadHandler = function() {
    if (vrame.unsavedChanges || rtesChanged())  {
      return "If you leave this page without submitting the form, none of the changes you made will be saved.";
    }
  };
  
  var onChangeHandler = function() {
    vrame.unsavedChanges = true;
  };
  
  var onSubmitHandler = function() {
    window.onbeforeunload = null;
  };
  
  // Install handlers if we're on a page that is a "new" or "edit" form
  if (!!$("body")[0].className.match(/va_edit|va_new/)) {
    $("input, textarea, select").change(onChangeHandler);
    $("form").submit(onSubmitHandler);
    window.onbeforeunload = onBeforeUnloadHandler;
  }
});