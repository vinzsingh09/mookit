// Multicenter namespace
var Multicenter = {
	// global vars
	scrollbar: null,
	scrolleffects: null,
	arrowclicked: false,
		
	fx: {
		totalcenters: null,
		zoom: null
	},
	filterlocked: false,
	centerhash: {},
	// hash template
	hashinfo: $H({type: '', id: '', name: '', contacts: 0, admins: 0, contacts_valid: 0, contacts_active: 0, date_created: 0, switch_url: '#'}),

	scrollInc: function (inc, max) {
		// set flag
		this.arrowclicked = true;
		
		// calculate next step
		var nextstep = this.scrollbar.step + inc;
		if (nextstep > max) nextstep = max;
		else if (nextstep < 0) nextstep = 0;
		this.scrollbar.set(nextstep);

		// reset flag
		this.arrowclicked = false;
	}, // end scrollInc()
	
	setupScrollbar: function() {
		// calculate size of scroller
		var dim = $('choosecenter').getSize();
		if (dim.scrollSize.y > dim.size.y) {
			// calculations
			var diff = dim.scrollSize.y - dim.size.y;
			// 120<max> - 30<min> = 90
			var scroll_height = Number.round(dim.size.y / dim.scrollSize.y * 90) + 30;

			// modify visible elements
			$('m_scrolltail').setStyle('height', scroll_height);
			$('m_scrollcontainer').show();
					
			// scrolling functionality
			this.scrolleffects = new Fx.Scroll('choosecenter', {
				wait: false,
				transition: Fx.Transitions.Quad.easeInOut
			}); // end scrolleffects()
			
			this.scrollbar = new Slider($('m_scrollbar'), $('m_scroller'), {	
				steps: diff,	
				mode: 'vertical',
				onChange: function(step) {
					if (Multicenter.arrowclicked) Multicenter.scrolleffects.scrollTo(0, step);
					else $('choosecenter').scrollTo(0, step);
				}
			}).set(0);
			
			// addEvents
			
			$('m_scrolltop').addEvent('click', function(e) {
				this.scrollInc(-150, diff);
			}.bind(this));
			
			$('m_scrollbottom').addEvent('click', function(e) {
				this.scrollInc(150, diff);
			}.bind(this));
			
			$('choosecenter').addEvent('mousewheel', function(e) {
				e = new Event(e).stop();
				
				/* Mousewheel UP */
				if (e.wheel > 0) {
					this.scrollInc(-150, diff);
				} 
				/* Mousewheel DOWN*/
				else if (e.wheel < 0) {
					this.scrollInc(150, diff);
				}
				
			}.bind(this));
			
		} // end if

	}, // end setupScrollbar()
	
	setupCenters: function(json) {
		// remove loading image
		$('choosecenter').removeClass('loading');

		// basic node template (all other nodes will be cloned from this -- speed performance)
		/* result:
			<div class="item">
				<div class="building">
					<a href="#"></a>
					<div class="info"></div>
				</div>
			</div>
		*/
		var wrapper = new Element('div', { 'class': 'item' });
		var type = new Element('div', { 'class': 'building' }).injectInside(wrapper);
		var link = new Element('a', { 'href': '#' }).injectInside(type);
		var info = new Element('div', { 'class': 'info' }).injectInside(type);

		// create html nodes from json
		var totalcenters = 0;
		json.multicenter.each(function(item) {
			var node = wrapper.clone();
			var type = node.getFirst();
			var link = type.getFirst();
			var info = type.getLast();

			// modify node based on item properties
			node.setProperty('id', 'zm_' + item.id);
			link.setText(item.name.truncate(20));
			info.setText(item.contacts.toPrettyInt() + ' contact'.pluralize(item.contacts));

			// conditionals
			if (item.type == 'all') type.setProperty('class', 'all');
			else totalcenters++;
			if (item['default']) new Element('span', { 'class': 'default' }).setText(' DEFAULT').injectAfter(link);
			if (item.current) node.addClass('active');
			
			// add js functionality to node
			node.addEvents({
				click: function(e) {
					new Event(e).stop();	// prevents href from firing off 
				
					// mark the change in 'active' centers
					var activenode = $('choosecenter').getChildren().filterByClass('active')[0];
					if (activenode) activenode.removeClass('active');
					this.removeClass('hover');
					this.addClass('active');	// "this" = currently clicked node
				
					// fire off getCenterInfo()
					Multicenter.getCenterInfo(this.id);
				},
				
				mouseenter: function(e) {
					if (!this.hasClass('active')) this.addClass('hover');
				},
				
				mouseleave: function(e) {
					this.removeClass('hover');
				}
			});
			
			// store basic info into newhash
			var newhash = {};
			Multicenter.hashinfo.each(function(value, key) {
				newhash[key] = item[key];
			});
			
			// store extra info into newhash
			newhash.fx = new Fx.Styles(node, {wait:false, duration:500});
			
			// add newhash into global hash
			Multicenter.centerhash['zm_' + item.id] = newhash;
			
			// insert node to DOM
			node.injectInside('choosecenter');
			
		}); // end json.multicenter.each()
		
		// update total count in darkbox and show
		$('m_total').setText('center'.pluralize(totalcenters, true));
		this.fx.totalcenters.start(1);
		
		// filter input
		$('m_input_filter').value = '';
		$('m_input_filter').addEvent('keyup', function () {
			if (!Multicenter.filterlocked) {
				Multicenter.filterlocked = true;	// lock filter down			
				Multicenter.filter.delay(400);
			}			
		});
		
		// turn global hash into $H
		this.centerhash = $H(this.centerhash);
		
		// on the get go, call up info on center
		var activenode = $('choosecenter').getChildren().filterByClass('active')[0];
		if (activenode) this.getCenterInfo(activenode.id);

	}, // end setupCenters()
	
	// prereq: node exists
	getCenterInfo: function(id) {
		var h = this.centerhash.get(id);
		var unixdate = String(h.date_created);
		unixdate = unixdate.substring(4,6) + '/' + unixdate.substr(6) + '/' + unixdate.substring(0, 4);
		$('zoom_name').setText(h.name + ' ');
		$('zoom_contacts_num').setText(h.contacts.toPrettyInt() + ' contact'.pluralize(h.contacts));
		$('zoom_contacts_valid').setText((h.contacts_valid/h.contacts).toPercent() + ' ');
		$('zoom_contacts_active').setText((h.contacts_active/h.contacts).toPercent() + ' ');
		$('zoom_date').setText(unixdate);
		$('zoom_admins').setText(h.admins.toPrettyInt() + ' administrator'.pluralize(h.admins) + ' ');
		$('zoom_switcher').href = h.switch_url || '#';
		
		// slide #zoom in if it's the first time
		if ($('zoom').getStyle('margin-top').toInt() < 0) this.fx.zoom.slideIn();
		
	}, // end getCenterInfo()
	
	// filter centers as you type
	// TODO: update scroll bar
	filter: function() {
		var search = $('m_input_filter').getValue();
		var width = (window.ie) ? 230 : 235;
		Multicenter.centerhash.each(function(center) {
			// found!
			if (search=='' || center.name.test('\\b' + search, 'i')) {
				Multicenter.scrollbar.set(0);	// scroll to top
				center.fx.start({width:width, margin:2, 'border-width':1, opacity:1});
			}
			// not found - disappear
			else {
				center.fx.start({width:0, margin: 0, 'border-width':0, opacity:0});
			}
		});
/*		if (console) console.log(search);*/
		Multicenter.filterlocked = false;	// release lock
		
	}, // end filter()
	
	setup: function(json) {
		this.setupCenters(json);
		this.setupScrollbar();
	}, // end setup()
	
	initialize: function() {
		// hide certain elements first
		$('m_scrollcontainer').hide();
		this.fx.totalcenters = $('m_total').effect('opacity').hide();
		this.fx.zoom = new Fx.Slide('zoom').hide();
	} // end initialize()
};

String.extend({
	// prettify integers
	// default: commas separate every 3 digits (from the right)
	// ex: "1234567" => "1,234,567"
	toPrettyInt: function(ch, digits) {
		if (!ch) ch = ',';
		if (!digits) digits = 3;
		
		var i = this.toInt();	// first, make sure it's an int
		if (!i) return i;		// if i is not an int, return it (NaN)
		
		var s = String(i);
		// TODO: this can be optimized; use .substr()
		var newstr = '';
		var separator = '';
		for (var j=s.length-1, k=1; j>=0; j--, k++) {
			separator = (k % digits == 0 && j != 0) ? ch : '';
			newstr = separator + s.charAt(j) + newstr;
		}
		
		return newstr;
	},
	
	// dummy way of pluralizing: adds an 's' to str if plural
	pluralize: function(num, printnum) {
		var returnstr = (printnum) ? num + ' ' + this : this;
		return (num==1) ? returnstr : returnstr + 's';
	},
	
	truncate: function(length, chars) {
		if (!chars) chars = '...';
		 return (length < this.length) ? this.substring(0, length) + chars : this;
	}
});

Number.extend({
	// look at String.toPrettyInt()
	toPrettyInt: function(ch, digits) {
		return String(this).toPrettyInt(ch, digits);
	},
	
	// converts to percent
	// (.25).toPercent() => '25%'
	toPercent: function(precision) {
		var r = (this * 100).round(precision);
		if (!$chk(r)) r = 0;	// return 0 if NaN
		return r + '%';
	}
});

window.addEvent('domready', function() {
	var url = $('CenterSwitcherSwitchLink') ? $('CenterSwitcherSwitchLink').name : '';
	var url_hash = url ? '?' + $time() : '';

	if (url) {
		var multicenter = new Darkbox('multicenter', 'CenterSwitcherSwitch', {
			outside_opacity: 0.5,
			remote: {
				type: 'json',
				url: url + url_hash,	// not ideal; should use params: instead...
				fade_duration: 200,
				onRequest: function() {
					Multicenter.initialize();
				},
				onComplete: function(centers) {
					Multicenter.setup(centers);
				}
			}
		});
	
		$('CenterSwitcherSwitch').addEvents({
			'mouseenter': function() {
				$('CenterSwitcherSwitch').addClass('hover');
			},
			'mouseleave': function () {
				$('CenterSwitcherSwitch').removeClass('hover');
			}
		});
	
		$('m_close').addEvent('click', function(e) {
			new Event(e).stop();	// prevents href from firing off 
			multicenter.close();
		});
	}
});

