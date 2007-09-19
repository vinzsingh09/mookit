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
	hashinfo: $H({type: '', id: '', name: '', contacts: 0, admins: 0, contacts_valid: 0, contacts_active: 0, date_created: 0, stats_updated: 0, switch_url: '#', edit_url: '#'}),
	current_id: '',

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
				this.scrollInc(-142, diff);
			}.bind(this));
			
			$('m_scrollbottom').addEvent('click', function(e) {
				this.scrollInc(142, diff);
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
		this.current_id = id;
		var h = this.centerhash.get(id);
		
/*		this.cancelRename();	// this needs to be fired before anything else*/
		$('zoom_switcher').href = h.switch_url || '#';		// update url
		
		if (h.type == 'all') {	// type all
			// logic: what/not to show
			if (!$('zoom').hasClass('all')) $('zoom').addClass('all');		// update icon
/*			$('zoom_rename_link').hide();*/
			$('zoom_edit_link').hide();
			$('zoom_allcenters_info').show();
			$('zoom_contacts_info').hide();

			// update text
			$('zoom_name').setText(h.name + ' have been selected');

		} 
		else {	// type building (or otherwise)
			// logic: what/not to show
			$('zoom').removeClass('all');
			$('zoom_allcenters_info').hide();
			$('zoom_contacts_info').show();
			$('zoom_edit_link').show();
			$('zoom_edit_link').href = h.edit_url || '#';
			
			// update text
			var createdate = String(h.date_created);
			createdate = createdate.substring(4,6) + '/' + createdate.substr(6) + '/' + createdate.substring(0,4);
			var updatedate = h.stats_updated;
			if (updatedate) {
				var updatehour = Number(updatedate.substring(9, 11));
				var updatesuffix = 'am';
				if (updatehour > 12) { 
					updatehour -= 12;
					updatesuffix = 'pm';
				}
				else if (updatehour == 12) updatesuffix = 'pm';
				else if (updatehour == 0) updatehour = 12;
				updatedate = updatedate.substring(4,6) + '/' + updatedate.substring(6,8) + '/' + updatedate.substring(2,4) + ', ' + updatehour + ':' + updatedate.substring(11, 13) + updatesuffix;
				$('zoom_statsdate').setText('Statistics last updated on ' + updatedate);
			}
			else $('zoom_statsdate').setText('Statistics not yet updated');

			$('zoom_name').setText(h.name.truncate(37) + ' ');
			$('zoom_contacts_num').setText(h.contacts.toPrettyInt() + ' contact'.pluralize(h.contacts));
			$('zoom_contacts_valid').setText((h.contacts_valid/h.contacts).toPercent() + ' ');
			$('zoom_contacts_active').setText((h.contacts_active/h.contacts).toPercent() + ' ');
			$('zoom_date').setText(createdate);
		}
		
		// slide #zoom in if it's the first time
		if ($('zoom').getStyle('margin-top').toInt() < 0) this.fx.zoom.slideIn();
		
	}, // end getCenterInfo()
	
	updateCenterName: function(id, newname) {
		//...
	}, // end updateCenterName()
	
	cancelRename: function() {
		$('zoom_indicator').hide();
		
		$('zoom_name').show();
		$('zoom_rename').hide();
		
		$('zoom_rename_link').show();
		$('zoom_cancel').hide();
	}, // end cancelRename()
	
	// filter centers as you type
	// TODO: update scroll bar
	filter: function() {
		var search = $('m_input_filter').value;
		var width = (window.ie) ? 230 : 235;
		var subtotal = 0;
		
		Multicenter.centerhash.each(function(center) {		
			// found!
			if (search=='' || search==Multicenter.search_placeholder || center.name.replace('_', ' ', 'g').test('\\b' + search, 'i')) {
				if (Multicenter.scrollbar) Multicenter.scrollbar.set(0);	// scroll to top
				center.fx.start({width:width, margin:2, 'border-width':1, opacity:1});
				if (center.type == 'center') subtotal++;
			}
			// not found - disappear
			else {
				center.fx.start({width:0, margin: 0, 'border-width':0, opacity:0});
			}
		});

/*		if (console) console.log('search: ' + search);*/
		if (search=='' || search==Multicenter.search_placeholder) $('m_subtotal').empty();
		else $('m_subtotal').setText(subtotal + ' of');
		Multicenter.filterlocked = false;	// release lock
		
	}, // end filter()
	
	setup: function(mc) {
		// remove loading image
		$('choosecenter').removeClass('loading');

		// test if mc is a true json
		if (mc === false) {
			$('choosecenter').setHTML('<div class="error">Your session has timed out. <br />Please log out and log back in.</br>');
			return;
		}
		
		// set up elements
		this.setupCenters(mc.centers);
		this.setupScrollbar();
		
		// update other elements
		if (mc.create_url) {
			$('createcenter').setProperty('href', mc.create_url);
			$('createcenter').show();
		}
		
		$('zoom_rename_link').addEvent('click', function(e) {
			new Event(e).stop();
			$('zoom_name').hide();
			$('zoom_rename').show();
			$('zoom_rename_input').value = this.centerhash.get(this.current_id).name;
			
			$('zoom_rename_link').hide();
			$('zoom_cancel').show();
		}.bind(this));
		$('zoom_cancel_link').addEvent('click', function(e) {
			new Event(e).stop();
			this.cancelRename();
		}.bind(this));
		
		// upon clicking submit
		$('form_rename').addEvent('submit', function(e) {
			new Event(e).stop();
			// update form elements
			$('zoom_rename_submit').setProperty('disabled', 'disabled');
			$('zoom_cancel').hide();
			$('zoom_indicator').show();
			
			// update hidden field
			var center = Multicenter.centerhash.get(Multicenter.current_id);
			$('zoom_current_id').value = center.id;
			
			// TODO: add/remove indicator
			// TODO: add error checks
			this.send({
				onSuccess: function(response) {
					eval('response = ' + response);
					if (response.type == 'success') {
						// update each "name" to the renamed one
						var rename = $('zoom_rename_input').value;
						$('zoom_name').setText(rename.truncate(37) + ' ');
						$(Multicenter.current_id).getFirst().getFirst().setText(rename.truncate(20));
						center.name = rename;

						// update form elements
						$('zoom_rename_submit').setProperty('disabled', '');
						Multicenter.cancelRename();	
					}
					// error response
					else {
						// ...
					}
				}
			});
		});
		
	}, // end setup()
	
	initialize: function() {
		// hide certain elements first
		$('m_scrollcontainer').hide();
		$('zoom_rename').hide();
		$('zoom_cancel').hide();
		$('zoom_indicator').hide();
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

// modify Json.evaluate
Json.evaluate = function(str, secure) {
	var o = '';
	if (($type(str) != 'string') || (secure && !str.test(/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/)))  {
		o = null;
	}
	else {
		if (str.test('DOCTYPE')) o = false;
		else o = eval('(' + str + ')');
	}
	return o;
}

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
		
		$('CenterSwitcherSwitchLink').setText($('CenterSwitcherSwitchLink').getText().truncate(29));
	
		$('m_close').addEvent('click', function(e) {
			new Event(e).stop();	// prevents href from firing off 
			multicenter.close();
		});
		$('createcenter').hide();
		
/*		$$('embed').each(function(elem) {
			elem.setProperty('wmode', 'transparent');
		});
*/		
		var prettyfilter = new PrettyFilter($('m_input_filter'));
		Multicenter.search_placeholder = prettyfilter.placeholders[0];

	}
});

