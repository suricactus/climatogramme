(function(window) {
	'use strict';

	const MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
	const DOMAIN_TEMP_BUFFER_DOWN = 10;
	const DOMAIN_TEMP_BUFFER_UP = 5;

	// helper
	function extend() {
		for(let i = 1; i<arguments.length; i++) {
			for(let key in arguments[i]) {
				if(arguments[i].hasOwnProperty(key)) {
						arguments[0][key] = arguments[i][key];
				}
			}
		}

		return arguments[0];
	}

	function roundUp(value, step) {
		return Math.ceil(value / step) * step;
	}

	function roundDown(value, step) {
		return Math.floor(value / step) * step;
	}


	function Climatogramme(s) {
		this.s = extend({
			el: null,
			width: 400,
			height: 600,
			primaryTitle: '',
			secondaryTitle: '',
			marginTop: 40,
			marginLeft: 40,
			marginRight: 40,
			marginBottom: 40,
			distanceBars: 0.1,
			labelTemperature: '°C',
			labelPrecipitation: 'mm',
			data: null,
		}, s);

		this.width = this.s.width - this.s.marginLeft - this.s.marginRight;
		this.height = this.s.height - this.s.marginTop - this.s.marginBottom;

		this.xScalePrec = d3.scale.ordinal().rangeBands([0, this.width], this.distanceBars);
		this.xScaleTemp = d3.scale.linear().rangeBands([0, this.width], 0);
		this.yScalePrec = d3.scale.linear().rangeBands([0, this.height], 0);
		this.yScaleTemp = d3.scale.linear().rangeBands([0, this.height], 0);

		this.xAxis = d3.svg.axis().scale(this.xScalePrec).orient('bottom');
		this.yAxisPrec = d3.svg.axis().scale(this.yScalePrec).orient('left');
		this.yAxisTemp = d3.svg.axis().scale(this.yScaleTemp).orient('right');

		this.svg = d3.select(this.el).append('svg')
			.attr('width', this.s.width + this.s.marginLeft + this.s.marginRight)
			.attr('height', this.s.height + this.s.marginTop + this.s.marginBottom);
		this.svgG = this.svg.append('g')
			.attr('transform', 'translate(' + this.s.marginLeft + ',' + this.s.marginTop + ')');

		this.render(this.s.data);
	};

	Climatogramme.prototype.render = function(data) {
		let extentPrec = d3.extent(data.precipitation);
		let extentTemp = d3.extent(data.meanTemperature);
		let valueline = d3.svg.line()
	    .x((d, i)  =>{ return this.xScaleTemp(i); })
	    .y((d) => { return this.yScaleTemp(d); })
	    .interpolate('basis');

		this.xScalePrec.domain(MONTHS.map((d) => { return d; } ));
		this.yScalePrec.domain([0, d3.max(data.precipitation)]);
		this.xScaleTemp.domain([0, MONTHS.length - 1]);
		this.yScaleTemp.domain([roundDown(extentTemp[0] + 1, DOMAIN_TEMP_BUFFER_DOWN), roundUp(extentTemp[1] + 1, DOMAIN_TEMP_BUFFER_UP) ]);


		// Set X and Y axis
		this.svgG.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + this.s.height + ')')
			.call(this.s.xAxis);

		this.svgG.append('g')
				.attr('class', 'y axis')
				.call(this.s.yAxisPrec)
			.append('text')
				.attr('y', '2em')
				.attr('x', '-0.75em')
				.style('text-anchor', 'end')
				.text(this.s.labelPrecipitation);

		this.svgG.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(' + this.s.width + ', 0)')
				.call(this.s.yAxisTemp)
			.append('text')
				.attr('y', '2em')
				.attr('x', '1em')
				.text(this.s.labelTemperature);

		// Draw precipitation bars
		this.svgG.selectAll('.bar')
				.data(data.precipitation)
			.enter().append('rect')
				.attr('class', 'bar')
				.attr('x', function(d, i) { return this.xScalePrec(MONTHS[i]); })
				.attr('width', this.xScalePrec.rangeBand())
				.attr('y', function(d) { return this.yScalePrec(d); })
				.attr('height', function(d) { return this.s.height - this.yScalePrec(d); });

		// Draw mean temperature
		this.svgG.append('path')
				.attr('d', valueline(data.meanTemperature))
				.attr('stroke', 'green')
				.attr('stroke-width', 2)
				.attr('fill', 'none');


		this.svg.append('g')
				.attr('class', 'caption')
			.append('text')
				.attr('y', '-2rem')
				.text('hello world')
	};

	window.Climatogramme = Climatogramme;
})(window);
