(function(window) {
	'use strict';

	const MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
	const TEMP_BUFFER_DOWN = 10;
	const TEMP_BUFFER_UP = 2;
	const PREC_BUFFER_UP = 20;

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

	function round(value, step) {
		return Math.round(value / step) * step;
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
			precipitationBufferUp: 20,
			temperatureBufferUp: 20,
			temperatureBufferDown: 10,
			labelTemperature: '°C',
			labelPrecipitation: 'mm',
			labelMeanTemperature: 'mean temperature',
			labelTotalPrecipitation: 'total precipitation',
			labelAplitudeTemperature: 'year aplitude',
			data: null,
		}, s);

		this.width = this.s.width - this.s.marginLeft - this.s.marginRight;
		this.height = this.s.height - this.s.marginTop - this.s.marginBottom;

		this.xScalePrec = d3.scale.ordinal().rangeBands([0, this.s.width], this.s.distanceBars);
		this.xScaleTemp = d3.scale.linear().range([0, this.s.width], 0);
		this.yScalePrec = d3.scale.linear().range([this.s.height, 0], 0);
		this.yScaleTemp = d3.scale.linear().range([this.s.height, 0], 0);

		this.xAxis = d3.svg.axis().scale(this.xScalePrec).orient('bottom');
		this.yAxisPrec = d3.svg.axis().scale(this.yScalePrec).orient('left').ticks(10).tickSize(-this.s.width, 0, 0);
		this.yAxisTemp = d3.svg.axis().scale(this.yScaleTemp).orient('right').ticks(20);

		this.svg = d3.select(this.s.el).append('svg')
			.attr('width', this.s.width + this.s.marginLeft + this.s.marginRight)
			.attr('height', this.s.height + this.s.marginTop + this.s.marginBottom)
			.attr('fill', 'white')
			.attr('version', '1.1')
			.attr('xmlns', 'http://www.w3.org/2000/svg');
		this.svgG = this.svg.append('g')
			.attr('transform', 'translate(' + this.s.marginLeft + ',' + this.s.marginTop + ')');

		this.render(this.s.data);
	};

	Climatogramme.prototype.render = function(data) {
		data.precipitation = data.precipitation.map((d) => { return +d || 0; });
		data.meanTemperature = data.meanTemperature.map((d) => { return +d || 0; });

		let extentPrec = d3.extent(data.precipitation);
		let extentTemp = d3.extent(data.meanTemperature);
		let valueline = d3.svg.line()
	    .x((d, i)  =>{ return this.xScaleTemp(i); })
	    .y((d) => { return this.yScaleTemp(d); })
	    .interpolate('basis');

	    console.log(data.precipitation, d3.max(data.precipitation), roundUp(d3.max(data.precipitation) + 1, this.s.precipitationBufferUp));
		this.xScalePrec.domain(MONTHS);
		this.yScalePrec.domain([0, roundUp(d3.max(data.precipitation) + 1, this.s.precipitationBufferUp)]);
		this.xScaleTemp.domain([0, MONTHS.length - 1]);
		this.yScaleTemp.domain([roundDown(extentTemp[0] + 1, this.s.temperatureBufferDown), roundUp(extentTemp[1] + 1, this.s.temperatureBufferUp) ]);

		// Set X and Y axis
		this.svgG.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + this.s.height + ')')
			.call(this.xAxis);

		this.svgG.append('g')
				.attr('class', 'y axis')
				.attr('fill', 'steelblue')
				.attr('shape-rendering', 'crispEdges')
				.attr('font-size', '10px')
				.call(this.yAxisPrec)
			.append('text')
				.attr('y', '2em')
				.attr('x', '-0.75em')
				.style('text-anchor', 'end')
				.text(this.s.labelPrecipitation);


		this.svgG.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(' + this.s.width + ', 0)')
				.attr('fill', 'red')
				.attr('shape-rendering', 'crispEdges')
				.attr('font-size', '10px')
				.call(this.yAxisTemp)
			.append('text')
				.attr('y', '2em')
				.attr('x', '1em')
				.text(this.s.labelTemperature);

		// Draw precipitation bars
		this.svgG.selectAll('.bar')
				.data(data.precipitation)
			.enter().append('rect')
				.attr('x', (d, i) => { return this.xScalePrec(MONTHS[i]); })
				.attr('y', (d) => { return this.yScalePrec(d); })
				.attr('fill', 'steelblue')
				.attr('width', this.xScalePrec.rangeBand())
				.attr('height', (d) => { return this.s.height - this.yScalePrec(d); });

		// Draw mean temperature
		this.svgG.append('path')
				.attr('d', valueline(data.meanTemperature))
				.attr('stroke', 'red')
				.attr('stroke-width', 4)
				.attr('fill', 'none');

		let summary = this.svg.append('g').attr('class', 'summary')
			.attr('font-size', '10px')
			.attr('transform', `translate(${ this.s.marginLeft }, ${ this.s.height + this.s.marginTop + 15 })`);

		let totalPrecipitation = round(d3.sum(data.precipitation), 1);
		let meanTemperature = round(d3.mean(data.meanTemperature), 0.01);
		let amplitude = round(extentTemp[1] - extentTemp[0], 0.01);
		let thirdClimatogramme = this.s.width / 3;

		summary.append('text')
			.attr('transform', `translate(${ thirdClimatogramme * 0.5 }, ${ 0 })`)
			.attr('width', this.s.width / 3 )
			.attr('fill', 'steelblue')
			.attr('text-anchor', 'middle')
			.text(`${ this.s.labelTotalPrecipitation}: ${ totalPrecipitation } ${ this.s.labelPrecipitation }`);

		summary.append('text')
			.attr('transform', `translate(${ thirdClimatogramme * 1.5 }, ${ 0 })`)
			.attr('width', this.s.width / 3 )
			.attr('fill', 'red')
			.attr('text-anchor', 'middle')
			.text(`${ this.s.labelMeanTemperature}: ${ meanTemperature } ${ this.s.labelTemperature }`);

		summary.append('text')
			.attr('transform', `translate(${ thirdClimatogramme * 2.5 }, ${ 0 })`)
			.attr('width', this.s.width / 3 * 2 )
			.attr('fill', 'red')
			.attr('text-anchor', 'middle')
			.text(`${ this.s.labelAplitudeTemperature}: ${ amplitude } ${ this.s.labelTemperature }`);

		this.svg.append('g')
				.attr('class', 'caption')
			.append('text')
				.attr('y', '20')
				.attr('x', (this.s.width + this.s.marginLeft + this.s.marginRight) / 2)
				.attr('text-anchor', 'middle')
				.attr('font-size', '20px')
				.attr('fill', 'black')
				.text(this.s.primaryTitle);

		this.svgG.selectAll('.axis path, .axis line')
			.attr('fill', 'none')
			.attr('stroke', 'grey')
			.attr('stroke-width', '1')
			.attr('shape-rendering', 'crispEdges');
	};

	window.Climatogramme = Climatogramme;
})(window);
