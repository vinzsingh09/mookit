/*
 *  Pretty Input (Mookit)
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2007
 *  required framework: Mootools v. 1.11+
 *
 *  Pretty Input is freely distributable under the terms of an MIT-style license.
 *  Based on http://images.apple.com/global/scripts/search_decorator.js
 *       and http://images.apple.com/global/scripts/apple_core.js
 *  Please visit http://code.google.com/p/mookit/ for more details.
/*------------------------------------------------------------------------------*/

var PrettyInput = new Class({
	// elems: can be one element ( $('search') ) or a collection of elements ( $$('input') )
	initialize: function(elems) {
		
		// basic node template (all other nodes will be cloned from this -- speed performance)
		/* result:
			<div class="search-wrapper">
				<span class="left"></span>
				// INSERT SEARCH FIELD HERE //
				<span class="right">
					<div class="reset"></div>
				</span>
			</div>
		*/
		
		var wrapper = new Element('div', { 'class': 'search-wrapper' });
		var left = new Element('span', { 'class': 'left' }).injectInside(wrapper);
		var right = new Element('span', { 'class': 'right' }).injectInside(wrapper);
		var reset = new Element('div', { 'class': 'reset' }).injectInside(right);
		
		// if elems is not an array, set it as one
		if ($type(elems) != 'array') elems = [elems];
		
		elems.each(function(node) {
			var label = node.getParent();
			if(label.getTag() == 'label') {
				
				var wrap = wrapper.clone();
				node.replaceWith(wrap);
				node.injectAfter(wrap.getFirst());
				
				node.addEvents({
					blur: function() {
						node.value = label.getText();
					},
					
					focus: function() {
						node.value = '';
					}
				})
				

			}
		});
	} // end initialize()

});

// basic node template (all other nodes will be cloned from this -- speed performance)
/* result:
	<div class="item">
		<div class="building">
			<a href="#"></a>
			<div class="info"></div>
		</div>
	</div>
*/

/*
AC.decorateSearchInput = function(field, options) {
	
	var searchField = $(field);
	var standIn = null;

	var results = 0;
	var placeholder = '';
	var autosave = '';

	if(options) {
		
		if(options.results) { results = options.results; }
		if(options.placeholder) { placeholder = options.placeholder; }
		if(options.autosave) { autosave = options.autosave; }
		
	}
	
	if(AC.Detector.isWebKit()) {
		
		searchField.setAttribute('type', 'search');
		if(!searchField.getAttribute('results')) {
			searchField.setAttribute('results', results);
		}
		
		if(null != placeholder) {
			searchField.setAttribute('placeholder', placeholder);
			searchField.setAttribute('autosave', autosave);
		}
		
	} else {
		
		//prevent browser from doing its own autocomplete, threw odd xul 
		//error on reset sometimes, although this feels a little
		//heavy handed
		searchField.setAttribute('autocomplete', 'off');
		
		//replace the field with a standin while we create the wrapper
		//we can't lose the reference to this field as other objects may
		//have already registered listeners on this field
		
		standIn = document.createElement('input');
		searchField.parentNode.replaceChild(standIn, searchField)

		var left = document.createElement('span');
		Element.addClassName(left, 'left');
	
		var right = document.createElement('span');
		Element.addClassName(right, 'right');
		
		var reset = document.createElement('div');
		Element.addClassName(reset, 'reset');
		
		var wrapper = document.createElement('div');
		Element.addClassName(wrapper, 'search-wrapper');
		
		var alreadyHasPlaceholder = field.value == placeholder;
		var isEmpty = field.value.length == 0;
		
		if (alreadyHasPlaceholder || isEmpty) {
			searchField.value = placeholder;
			Element.addClassName(wrapper, 'blurred');
			Element.addClassName(wrapper, 'empty');
		}
	
		wrapper.appendChild(left);
		wrapper.appendChild(searchField);
		wrapper.appendChild(right);
		wrapper.appendChild(reset);
	
		var focus = function() {
			
			var blurred = Element.hasClassName(wrapper, 'blurred');

			//need to check for flag AND placeholder lest somebody need to 
			//search for the placeholder text itself
			if(searchField.value == placeholder && blurred) {
				searchField.value = '';
			}
			
			Element.removeClassName(wrapper, 'blurred');
		}
		Event.observe(searchField, 'focus', focus);
		
		var blur = function() {
			
			if(searchField.value == '') {
				Element.addClassName(wrapper, 'empty');
				searchField.value = placeholder;
			}
			
			Element.addClassName(wrapper, 'blurred');
		}
		Event.observe(searchField, 'blur', blur);
		
		
		var toggleReset = function() {
			
			if(searchField.value.length >= 0) {
				Element.removeClassName(wrapper, 'empty');
			}
		}
		Event.observe(searchField, 'keydown', toggleReset);
	
	
		var resetField = function() {
			return( function(evt) {
				
				var escaped = false;
				
				if(evt.type == 'keydown') {
					if(evt.keyCode != 27) {
						return; //if it's not escape ignore it
					} else {
						escaped = true;
					}
				}
				
				searchField.blur(); //can't change value while in field
				searchField.value = '';
				Element.addClassName(wrapper, 'empty');
				searchField.focus();

			})
		}
		Event.observe(reset, 'mousedown', resetField());
		Event.observe(searchField, 'keydown', resetField());
	
		if (standIn) {
			standIn.parentNode.replaceChild(wrapper, standIn);
		}
		
	}
}*/
