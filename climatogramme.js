(function(window) {
	'use strict';

	const MONTHS = {
		'Roman (I-XII)': ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'],
		'BG Abbr (яну-дек)': ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'],
		'BG Letters (Я-Д)': ['Я', 'Ф', 'М', 'А', 'М ', 'Ю', 'Ю ', 'А ', 'С', 'О', 'Н', 'Д'],
		'Latin Abbr (Jan-Dec)': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		'Latin Letters (J-D)': ['J', 'F', 'M', 'A', 'M ', ' J', 'J ', 'A ', 'S', 'O', 'N', 'D']
	};
	const TEMP_TICK_SIZE = 2;
	const PREC_TICK_SIZE = 20;
	const D3_TICK_STEPS = [1, 2, 5];


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

	function getActualStep(rangeSize, numSteps) {
		let actualStep = 1;
		let calcStep = rangeSize / numSteps;
		let log = Math.floor(Math.log10(calcStep));

		if(log < 0 || log >= 1) {
			calcStep = calcStep / Math.pow(10, log);
		}

		for(let i = 0, l = D3_TICK_STEPS.length; i < l; i++) {
			if(D3_TICK_STEPS[l - 1 - i] >= calcStep) {
				actualStep = D3_TICK_STEPS[l - 1 - i];
			}
		}

		return actualStep * Math.pow(10, log);
	}

	function Climatogramme(s) {
		this.s = extend({
			el: null,
			width: 400,
			height: 600,
			primaryTitle: '',
			secondaryTitle: '',
			fontSizeSummary: 12,
			fontFamily: 'sans-serif',
			precipitationColor: '#4682B4',
			tempColor: '#ff0000',
			fontSizeXAxis: 12,
			fontSizeYAxis: 12,
			numberTicks: 20,
			y: 10,
			yAxisMargin: 10,
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
			labelMeanTemperature: 'mean t',
			labelTotalPrecipitation: 'precipitation',
			labelAplitudeTemperature: 't aplitude',
			data: null,
			whiteBackground: true,
			monthLabels: 'Roman (I-XII)'
		}, s);

		this.width = this.s.width - this.s.marginLeft - this.s.marginRight;
		this.height = this.s.height - this.s.marginTop - this.s.marginBottom;

		this.xScalePrec = d3.scale.ordinal().rangeBands([0, this.s.width], this.s.distanceBars);
		this.xScaleTemp = d3.scale.linear().range([0, this.s.width], 0);
		this.yScalePrec = d3.scale.linear().range([this.s.height, 0], 0);
		this.yScaleTemp = d3.scale.linear().range([this.s.height, 0], 0);

		this.xAxis = d3.svg.axis().scale(this.xScalePrec).orient('bottom').tickPadding(this.s.xAxisMargin).tickSize(0, 0, 0);
		this.yAxisPrec = d3.svg.axis().scale(this.yScalePrec).orient('left').ticks(this.s.numberTicks).tickPadding(this.s.yAxisMargin).tickSize(-this.s.width, 0, 0);
		this.yAxisTemp = d3.svg.axis().scale(this.yScaleTemp).orient('right').ticks(this.s.numberTicks).tickPadding(this.s.yAxisMargin);

		this.svg = d3.select(this.s.el).append('svg')
			.attr('width', this.s.width + this.s.marginLeft + this.s.marginRight + this.s.yAxisMargin + 10)
			.attr('height', this.s.height + this.s.marginTop + this.s.marginBottom + this.s.xAxisMargin + this.s.fontSizeYAxis)
			.style('background-color', this.s.whiteBackground ? 'white' : 'transparent')
			.attr('version', '1.1')
			.attr('xmlns', 'http://www.w3.org/2000/svg')
			.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');
		this.svgG = this.svg.append('g')
			.attr('transform', 'translate(' + this.s.marginLeft + ',' + this.s.marginTop + ')');

		this.render(this.s.data);
	};

	Climatogramme.prototype.render = function(data) {
		data.precipitation = data.precipitation.map((d) => { return +d || 0; });
		data.meanTemperature = data.meanTemperature.map((d) => { return +d || 0; });

		let extentPrec = d3.extent(data.precipitation);
		let extentTemp = d3.extent(data.meanTemperature);
		let maxPrecValue = roundUp(extentPrec[1] + this.s.precipitationBufferUp, PREC_TICK_SIZE);
		let precActualStep = getActualStep(maxPrecValue, this.s.numberTicks);
		let precNumSteps = maxPrecValue / precActualStep;
		let maxTempValue = roundUp(extentTemp[1] + this.s.temperatureBufferUp, TEMP_TICK_SIZE);
		let minTempValue = roundDown(extentTemp[0] - this.s.temperatureBufferDown, TEMP_TICK_SIZE);
		let aplitudeTempValue = maxTempValue - minTempValue;
		let tempActualStep = getActualStep(aplitudeTempValue, precNumSteps);
		let syncMaxTempValue = roundUp(maxTempValue, tempActualStep);
		let syncMinTempValue = syncMaxTempValue - (tempActualStep * precNumSteps);

		let valueline = d3.svg.line()
			.x((d, i)  =>{ return this.xScaleTemp(i); })
			.y((d) => { return this.yScaleTemp(d); })
			.interpolate('basis');



		this.xScalePrec.domain(MONTHS[this.s.monthLabels]);
		this.yScalePrec.domain([0, maxPrecValue]);
		this.xScaleTemp.domain([0, MONTHS[this.s.monthLabels].length - 1]);
		this.yScaleTemp.domain([syncMinTempValue, syncMaxTempValue]);


		// Set X and Y axis
		this.svgG.append('g')
			.attr('class', 'x axis')
			.attr('fill', 'black')
			.attr('font-size', this.s.fontSizeXAxis)
			.attr('font-family', this.s.fontFamily)
			.attr('transform', `translate(0, ${this.s.height})`)
			.call(this.xAxis);

		this.svgG.append('g')
				.attr('class', 'y axis')
				.attr('fill', this.s.precipitationColor)
				.attr('shape-rendering', 'crispEdges')
				.attr('font-size', this.s.fontSizeYAxis + 'px')
				.attr('font-family', this.s.fontFamily)
			.call(this.yAxisPrec)
			.append('text')
				.attr('y', this.s.height + this.s.fontSizeYAxis + 5)
				.attr('x', -this.s.yAxisMargin + 5)
				.style('text-anchor', 'end')
				.text(this.s.labelPrecipitation);


		this.svgG.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(' + this.s.width + ', 0)')
				.attr('fill', this.s.tempColor)
				.attr('shape-rendering', 'crispEdges')
				.attr('font-size', this.s.fontSizeYAxis + 'px')
				.attr('font-family', this.s.fontFamily)
			.call(this.yAxisTemp)
			.append('text')
				.attr('y', this.s.height + this.s.fontSizeYAxis + 5)
				.attr('x', this.s.yAxisMargin + 5)
				.text(this.s.labelTemperature);

		// Draw precipitation bars
		this.svgG.selectAll('.bar')
				.data(data.precipitation)
			.enter().append('rect')
				.attr('x', (d, i) => { return this.xScalePrec(MONTHS[this.s.monthLabels][i]); })
				.attr('y', (d) => { return this.yScalePrec(d); })
				.attr('fill', this.s.precipitationColor)
				.attr('width', this.xScalePrec.rangeBand())
				.attr('height', (d) => { return this.s.height - this.yScalePrec(d); });

		// Draw mean temperature
		this.svgG.append('path')
				.attr('d', valueline(data.meanTemperature))
				.attr('stroke', this.s.tempColor)
				.attr('stroke-width', 4)
				.attr('fill', 'none');

		let summary = this.svg.append('g').attr('class', 'summary')
			.attr('font-size', '10px')
			.attr('transform', `translate(${ this.s.marginLeft }, ${ this.s.marginTop + this.s.fontSizeSummary })`);

		let totalPrecipitation = round(d3.sum(data.precipitation), 1).toFixed(0);
		let meanTemperature = round(d3.mean(data.meanTemperature), 0.01).toFixed(2);
		let amplitude = round(extentTemp[1] - extentTemp[0], 0.01).toFixed(2);
		let thirdClimatogramme = this.s.width / 3;

		summary.append('text')
			.attr('transform', `translate(${ thirdClimatogramme * 0.5 }, ${ 0 })`)
			.attr('width', this.s.width / 3 )
			.attr('fill', this.s.precipitationColor)
			.attr('text-anchor', 'middle')
			.attr('font-size', this.s.fontSizeSummary)
			.attr('font-family', this.s.fontFamily)
			.text(`${ this.s.labelTotalPrecipitation}: ${ totalPrecipitation } ${ this.s.labelPrecipitation }`);

		summary.append('text')
			.attr('transform', `translate(${ thirdClimatogramme * 1.5 }, ${ 0 })`)
			.attr('width', this.s.width / 3 )
			.attr('fill', this.s.tempColor)
			.attr('text-anchor', 'middle')
			.attr('font-size', this.s.fontSizeSummary)
			.attr('font-family', this.s.fontFamily)
			.text(`${ this.s.labelMeanTemperature}: ${ meanTemperature } ${ this.s.labelTemperature }`);

		summary.append('text')
			.attr('transform', `translate(${ thirdClimatogramme * 2.5 }, ${ 0 })`)
			.attr('width', this.s.width / 3 * 2 )
			.attr('fill', this.s.tempColor)
			.attr('text-anchor', 'middle')
			.attr('font-size', this.s.fontSizeSummary)
			.attr('font-family', this.s.fontFamily)
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
