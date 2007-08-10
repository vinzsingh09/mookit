/*
 *  MooKit.js - MooTools++
 *  Abe Yang <abeyang@cal.berkeley.edu> (c) 2007
 *  required framework: Mootools v. 1.11+
 *
 *  MooKit is freely distributable under the terms of an MIT-style license.
 *  Please visit http://code.google.com/p/mookit/ for more details.
/*--------------------------------------------------------------------------*/

// make Element class more Prototype-esque
Element.extend({
        hide: function() {
			this.setStyle('display', 'none');
        },

        show: function() {
			this.setStyle('display', '');
        },

        toggle: function() {
			(this.getStyle('display') == "none") ? this.show() : this.hide();
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
