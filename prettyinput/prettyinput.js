/*
 *  Pretty Input (Mookit)
 *  version 0.3
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2007
 *  required framework: Mootools v. 1.11+
 *
 *  Pretty Input is freely distributable under the terms of an MIT-style license.
 *  Based on http://images.apple.com/global/scripts/search_decorator.js
 *       and http://images.apple.com/global/scripts/apple_core.js
 *       and http://www.artweb-design.de/2007/4/16/safari-beautiful-search-input-tag-fixed
 *  Please visit http://code.google.com/p/mookit/ for more details.
/*----------------------------------------------------------------------------------------*/

var PrettyInput = new Class({
	placeholders: [],
	
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
		
		var wrapper = new Element('div', { 'class': 'search-wrapper empty blurred' });
		
		// fundamental differences between webkit (eg, Safari) and the rest of the browswers:
		// webkit has an input type "search"
		if (!window.webkit) {
			var left = new Element('span', { 'class': 'search-left' }).injectInside(wrapper);
			var right = new Element('span', { 'class': 'search-right' }).injectInside(wrapper);
			var reset = new Element('div', { 'class': 'search-reset' }).injectInside(right);
		}
		
		// if elems is not an array, set it as one
		if ($type(elems) != 'array') elems = [elems];
		
		elems.each(function(node) {
			var label = node.getParent(), placeholder = '';
			if(label.getTag() == 'label') {
				var placeholder = label.getFirst().innerHTML;
			}
			this.placeholders.push(placeholder);

			// clone wrapper; insert node into it
			var wrap = wrapper.clone();
			node.replaceWith(wrap);

			// good ol' webkit... sigh.
			if (window.webkit) {
				node.setProperties({
					type: 'search',
					placeholder: placeholder
				});
				node.injectInside(wrap);
			}
			else {
				node.setProperty('autocomplete', 'off');
				node.injectAfter(wrap.getFirst());
			
				// add events to node
				node.addEvents({
					blur: function() {
						if (node.value == '') {
							node.value = placeholder;
						
							if (!wrap.hasClass('empty')) wrap.addClass('empty');
						}
						wrap.addClass('blurred');
					},
				
					focus: function() {
						if (node.value == label.getText()) {
							node.value = '';
						}
						wrap.removeClass('blurred');
					},
				
					keyup: function() {
						if (node.value == '' && !wrap.hasClass('empty')) wrap.addClass('empty');
						else if (node.value != '') wrap.removeClass('empty');
					}
				
				});
				
				// set reset (if not webkit)
				if (!window.webkit) this.setReset(wrap.getLast().getFirst(), node);
				
				this.onload(node);

			}
		}, this);
	}, // end initialize()
	
	setReset: function(reset, node) {
		reset.addEvent('click', function() {
			node.value = '';
			node.fireEvent('blur');
		});
	}, // end setReset
	
	onload: function(node) {
		node.value = '';
		node.fireEvent('blur');		// do a blur onload
	} // end onload

});

