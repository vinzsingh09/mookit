/*
 *  Darkbox Framework
 *  version 0.231
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2008
 *  required framework: Mootools v. 1.11+
 *  
 *  Darkbox is freely distributable under the terms of an MIT-style license.
 *  Please visit http://code.google.com/p/darkbox-framework/ for more details.
/*--------------------------------------------------------------------------*/

/*
TODO
* ie6: overlay stops a bit short on the right... scrollbar issue?
*/

var DarkboxInfo = {
	version: '0.231'
};

var Darkbox = new Class({
	options: {
		outside_click: true,
		outside_opacity: .8,
		set_position: true,
		fade_duration: 500,
		remote: {
			type: 'ajax',	// 'ajax' or 'json'
			url: '',
			method: 'get',
			update: ''
		}
	}, // end options{}
	
	// id = darbox id
	// elements = ['id1', 'id2', ...] OR 'id1' OR $('id1')
	//		(element id(s) that will trigger darbox to turn on)
	initialize: function(id, elements, args) {
		this.id = id;
		this.isopen = false;

		// update options
		args.remote = $extend(this.options.remote, args.remote);
		this.options = $extend(this.options, args);
		
		// modify main content
		var boxwidth = $(id).getSize().size.x;
/*		$(id).setStyle('marginLeft', -(boxwidth/2));*/
		
		// initialize other html elements
		if (!$('dark_outside')) {
			var outside = new Element('div', {'id': 'darkbox_overlay'}).injectTop(document.body);
			if (this.options.outside_click) {
				outside.onclick = this.close.bind(this);
				outside.setStyle('cursor', 'pointer');
			}
		}
		
		// bindings
		this.eventPosition = this.position.bind(this);
		
		// effects
		this.fx = {
			main: $(id).effect('opacity', {duration:this.options.fade_duration}).hide(),
			overlay: $('darkbox_overlay').effect('opacity', {duration:this.options.fade_duration}).hide()
		};
		
		if (elements) {
			// attach onclick events to 'elements'
			if ($type(elements) != 'array') {
				// stuff this singular element into an array (of 1)
				elements = [elements];
			}

			elements.each(function(node) {
				$(node).addEvent('click', function(e) {
					new Event(e).stop();	// prevents href from firing off
					this.open();
				}.bind(this));			
			}, this);
		}

	}, // end initialize()
	
	open: function() {
		$(this.id).show();
		this.setup(true);
		var type = this.options.remote.type;
		var url = this.options.remote.url;
		if (type && url != '') {
			if (type == 'ajax') {
				var node = $(this.options.remote.update);
				new Ajax(url, this.options.remote).request();
			}
			else if (type == 'json') {
				new Json.Remote(url, this.options.remote).send();
			}
			
			// once remote call is established, no need to call it every single time
			this.options.remote.url = '';
		}
		this.position();
		this.fx.main.start(1);
		this.fx.overlay.start(this.options.outside_opacity);
	}, // end open()
	
	position: function() {
		$('darkbox_overlay').setStyles({'top': 0, 'height': window.getSize().scrollSize.y});
		if (this.options.set_position) {
			// TODO: set to absolute center (from top)
			$(this.id).setStyles({
/*				'position': window.ie ? 'absolute' : 'fixed',*/
				'top': window.getScrollTop() + (window.getHeight() / 15),
				'left': ((window.getWidth() - $(this.id).getSize().size.x) / 2)
			});
		}
	},
	
	setup: function(open_it) {
		this.isopen = open_it;
		
		if (window.ie6) {
			var elements = $$('select');
			if (open_it) elements.addClass('darkbox_invisible');
			else elements.removeClass('darkbox_invisible');
		}
		
/*		var fn = is_open ? 'addEvent' : 'removeEvent';
		window[fn]('scroll', this.eventPosition)[fn]('resize', this.eventPosition);*/
	},
	
	close: function() {
		this.fx.main.start(0);
		this.fx.overlay.start(0).chain(function() {
			this.setup(false);
		}.bind(this));
	}
});

