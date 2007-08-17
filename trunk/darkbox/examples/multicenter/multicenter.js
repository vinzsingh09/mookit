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
	search_placeholder: '',
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
	
	setupCenters: function(centers) {
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
		centers.each(function(item) {
			var node = wrapper.clone();
			var type = node.getFirst();
			var link = type.getFirst();
			var info = type.getLast();

			// modify node based on item properties
			node.setProperty('id', 'zm_' + item.id);
			link.setText(item.name.truncate(20));
			if (item.type == 'all') {
				type.setProperty('class', 'all');
			}
			else {
				info.setText(item.contacts.toPrettyInt() + ' contact'.pluralize(item.contacts));
				totalcenters++;
			}
			
			// other conditionals
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
			
		}); // end centers.each()
		
		// update total count in darkbox and show
		$('m_total').setText('center'.pluralize(totalcenters, true));
		this.fx.totalcenters.start(1);
		
		// filter input
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
		
		// update icon
		if (h.type == 'all') {	// type all
			// logic: what/not to show
			if (!$('zoom').hasClass('all')) $('zoom').addClass('all');
			$('zoom_rename').hide();
			$('zoom_allcenters_info').show();
			$('zoom_contacts_info').hide();

			// update text
			$('zoom_name').setText(h.name + ' have been selected');
		} 
		else {	// type building (or otherwise)
			// logic: what/not to show
			$('zoom').removeClass('all');
			$('zoom_rename').show();
			$('zoom_allcenters_info').hide();
			$('zoom_contacts_info').show();
			
			// update text
			var unixdate = String(h.date_created);
			unixdate = unixdate.substring(4,6) + '/' + unixdate.substr(6) + '/' + unixdate.substring(0, 4);
			$('zoom_name').setText(h.name + ' ');
			$('zoom_contacts_num').setText(h.contacts.toPrettyInt() + ' contact'.pluralize(h.contacts));
			$('zoom_contacts_valid').setText((h.contacts_valid/h.contacts).toPercent() + ' ');
			$('zoom_contacts_active').setText((h.contacts_active/h.contacts).toPercent() + ' ');
			$('zoom_date').setText(unixdate);
			$('zoom_admins').setText(h.admins.toPrettyInt() + ' administrator'.pluralize(h.admins) + ' ');
			$('zoom_switcher').href = h.switch_url || '#';
		}
		
		
		// slide #zoom in if it's the first time
		if ($('zoom').getStyle('margin-top').toInt() < 0) this.fx.zoom.slideIn();
		
	}, // end getCenterInfo()
	
	// filter centers as you type
	// TODO: update scroll bar
	filter: function() {
		var search = $('m_input_filter').value;
		var width = (window.ie) ? 230 : 235;
		Multicenter.centerhash.each(function(center) {
			// found!
			if (search=='' || search==Multicenter.search_placeholder || center.name.test('\\b' + search, 'i')) {
				if (Multicenter.scrollbar) Multicenter.scrollbar.set(0);	// scroll to top
				center.fx.start({width:width, margin:2, 'border-width':1, opacity:1});
			}
			// not found - disappear
			else {
				center.fx.start({width:0, margin: 0, 'border-width':0, opacity:0});
			}
		});
/*		if (console) console.log('search: ' + search);*/
		Multicenter.filterlocked = false;	// release lock
		
	}, // end filter()
	
	setup: function(json) {
		var mc = json.multicenter;
		
		// set up elements
		this.setupCenters(mc.centers);
		this.setupScrollbar();
		
		// update elements
		$('createcenter').setProperty('href', mc.create_url);
	}, // end setup()
	
	initialize: function() {
		// hide certain elements first
		$('m_scrollcontainer').hide();
		this.fx.totalcenters = $('m_total').effect('opacity').hide();
		this.fx.zoom = new Fx.Slide('zoom').hide();
	} // end initialize()
};

var PrettyFilter = PrettyInput.extend({
	setReset: function(reset, node) {
		reset.addEvent('click', function() {
			node.value = '';
			node.fireEvent('blur');
			Multicenter.filter();
		});
	} // end setReset
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
		
		$('CenterSwitcherSwitchLink').setText($('CenterSwitcherSwitchLink').getText().truncate(40));
	
		$('m_close').addEvent('click', function(e) {
			new Event(e).stop();	// prevents href from firing off 
			multicenter.close();
		});
		
		var prettyfilter = new PrettyFilter($('m_input_filter'));
		Multicenter.search_placeholder = prettyfilter.placeholders[0];
	}
});

