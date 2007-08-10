/*
 *  Carousel (MooKit)
 *  version 0.1
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2007
 *  required framework: Mootools v. 1.11+
 *
 *  Carousel is freely distributable under the terms of an MIT-style license.
 *  Please visit http://code.google.com/p/mookit/ for more details.
/*--------------------------------------------------------------------------*/

var Carousel = new Class({
	options: {
		// Carousel options
		menu_class: null,
		scroll_left: null,
		scroll_right: null,
		start_index: 0,
		// Fx.Scroll options
		wait: false,
		duration: 1500,
		offset: {x: 0, y: 0},
		transition: Fx.Transitions.Quad.easeInOut
	}, // end options{}
	
	activeindex: 0,

	// container: id or element of container
	// items: either tags ('a') or classes ('.classname') that exist inside container
	initialize: function(container, items, args) {
		container = $(container);
	
		args.offset = $extend(this.options.offset, args.offset);
		this.options = $extend(this.options, args);
	
		// init scroll
		this.scroll = new Fx.Scroll(container, this.options);
	
		// init items array
		this.items = $$('#' + container.id + ' ' + items);
		if (!this.items.length) {
			alert(items + ' is not a valid tag or class');
			return;
		}
		
		// init next/prev links
		var r = this.options.scroll_right, l = this.options.scroll_left;
		if (r && $(r)) $(r).addEvent('click', function(e) {
			new Event(e).stop();
			this.goNext();
		}.bind(this));
		if (l && $(l)) $(l).addEvent('click', function(e) {
			new Event(e).stop();
			this.goPrev();
		}.bind(this));

		// init menu array
		if (this.options.menu_class) {
			this.menu = $$('.' + this.options.menu_class);
			this.setupMenu();
		}
		
		// initialize page
		this.goto(this.options.start_index);
	}, // end initialize()
				
	// init menu functionality (if there is one)
	setupMenu: function() {
		this.menu.each(function(node, i) {
			node.addEvent('click', function(e) {
				new Event(e).stop();
				this.goto(i);
			}.bind(this));
		}, this);
	}, // end setupMenu()
	
	// prereq: index is within the bounds of this.menu array
	goto: function(index) {
		this.scroll.toElement(this.items[index]);
		this.activeindex = index;
	}, // end goto()
	
	goNext: function() {
		var index = this.activeindex + 1;
		if (index >= this.menu.length) index = 0;
		this.goto(index);
	},
	
	goPrev: function() {
		var index = this.activeindex - 1;
		if (index < 0) index = this.menu.length - 1;
		this.goto(index);
	}
	
}); // end Carousel
