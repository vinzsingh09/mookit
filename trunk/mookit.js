/*
 *  MooKit.js - MooTools++
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2007
 *  required framework: Mootools v. 1.11+
 *
 *  MooKit is freely distributable under the terms of an MIT-style license.
 *  Please visit http://code.google.com/p/mookit/ for more details.
/*--------------------------------------------------------------------------*/

Element.extend({
	popup: function(options) {
		this.addEvent('click', function(e) {
			new Event(e).stop();

			var defaultoptions = {
				name: 'new_window',
				width: 640,
				height: 480,
				status: 0,
				location: 0,
				menubar: 0,
				toolbar: 0,
				resizable: 1,
				scrollbars: 1
			};
		
			var str = '';
			options = options || {};
			options = $H($extend(defaultoptions, options));
			options.each(function(val, key) {
				if (str != '') str += ',';
				str += key + '=' + val;
			});
		
			window.open(this.href, options.name, str);
		}, this);
	},
	
	// following makes Element class more Prototype-esque:
    hide: function() {
            this.setStyle('display', 'none');
    },

    show: function() {
            this.setStyle('display', '');
    },

    toggle: function() {
            (this.getStyle('display') == "none") ? this.show() : this.hide();
    },
    
    visible: function() {
            return (this.getStyle('display') == "none") ? false : true;
    },
    
    hasClassName: function(name) { 
    		return this.hasClass(name);
    },
    
    immediateDescendants: function() { 
    		return this.getChildren();
    }, 
    
    ancestors: function () {
	        var result = [], el = this;
    		while (el = el.getTag() !== 'html' ? el.getParent() : false) result.push(el);
	        return $$(result);
	},
    
    down: function(cssRule, index) {
    		if ((cssRule == null || cssRule == 0) && (index == null || index == 0)) return this.getFirst();        
    		if (index == null) index = 0;

    		var elems = this.getElements(cssRule);
     		return elems[index];
    },
    
    up: function(cssRule, index) {
    		if ((cssRule == null || cssRule == 0) && (index == null || index == 0)) return this.getParent();            		       		
    		
    		if (cssRule == null) {
     			var elems = this.ancestors();
        		if (index == null) index = 0;     	         			
     			return elems[index]
    		} else {
    			elems = $$(cssRule);
    			
        		var parent_el = this.getParent();
        		var curr_index = 0;
        		while(parent_el) {        			
        			if ((index == null || curr_index == index) && elems.contains(parent_el)) {
        				return parent_el;
        			} else {
        				curr_index++;
        				parent_el = parent_el.getParent();
        			}
        		}       			
    		}        		
    },
    
    previous: function(cssRule, index) {
    		if (cssRule == null && index == null) return this.getPrevious();

    		// Filter out siblings
    		var siblings_filtered = this.getParent().getElements(cssRule);
    		
    		var previous_sibling = this.getPrevious();
    		var curr_index = 0;
    		while(previous_sibling) {        			
    			if ((index == null || curr_index == index) && siblings_filtered.contains(previous_sibling)) {
    				return previous_sibling;
    			} else {
    				curr_index++;
    				previous_sibling = previous_sibling.getPrevious();
    			}
    		}
    },   
            
    next: function(cssRule, index) {
    		if (cssRule == null && index == null) return this.getPrevious();

    		// Filter out siblings
    		var siblings_filtered = this.getParent().getElements(cssRule);

    		var next_sibling = this.getNext();
    		var curr_index = 0;
    		while(next_sibling) {        			
    			if ((index == null || curr_index == index) && siblings_filtered.contains(next_sibling)) {
    				return next_sibling;
    			} else {
    				curr_index++;
    				next_sibling = next_sibling.getNext();
    			}
    		}
    }

});

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
