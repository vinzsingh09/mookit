/*
 *  Slick Carousel - an extension of Carousel
 *
 *  Carousel is freely distributable under the terms of an MIT-style license.
 *  Please visit http://code.google.com/p/mookit/ for more details.
/*--------------------------------------------------------------------------*/
var SlickCarousel = Carousel.extend({
	goto: function(index) {
		var prev = this.activeindex;

		this.menu[prev].removeClass('active');
		this.menu[prev].addClass('inactive');
		
		this.menu[index].removeClass('inactive');
		this.menu[index].addClass('active');
						
		this.parent(index);
	}  // end goto()

}); // end SlickCarousel
	
