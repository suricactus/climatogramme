$(function() {
	'use strict';

  const NUM_ROWS = 2;
  const NUM_COLS = 12;
  const NUM_MONTHS = 12;

	let DOMform = document.getElementById('climatogramme-form');
	let DOMtable = document.getElementById('climatogramme-data');
	let DOMresult = document.getElementById('result');
	let DOMmsg = document.getElementById('msg');
	let queryParams = parseQuery();
	let editor;
	let climatogramme;
	let table;

	$('#btn-save').click(function() {
  	DOMmsg.hidden = true;
		saveJson(extractValues());
	});

	$('#btn-download').click(function() {
		saveClimatogramme();
	});

	$.getJSON('./schema.json', function(result) {
		$(DOMform).empty();

		editor = new JSONEditor(DOMform, {
		  schema: result,
		  disable_array_add: true,
		  disable_array_delete: true,
		  disable_array_reorder: true,
		  disable_collapse: true,
		  disable_edit_json: true,
		  disable_properties: true,
		  no_additional_properties: true,
		  theme: 'bootstrap3'
		});

		loadJson();

		editor.on('change',function() {
		  updateClimatogram();
		});
	});


  table = buildTable();



  function updateClimatogram() {
  	if(!editor) return;

  	let options = extractValues();

  	delete options.saveImageAs;

  	DOMmsg.hidden = false;

  	$(DOMresult).empty();

  	climatogramme = new Climatogramme(options);
  }

  function extractValues() {
		let values = $.extend({}, editor.getValue());
  	let data = table.getData();

  	values.el = DOMresult;
  	values.data = {
  		precipitation: data[0],
  		meanTemperature: data[1],
  	};

  	return values;
  }



  function buildData() {
  	let data = [];

    for(let i = 0; i < NUM_ROWS; i++) {
    	let row = [];

    	for(let k = 0; k < NUM_COLS; k++) {
    		row.push(0);
    	}

      data.push(row);
    }

    return data;
  }

  function sumRow(context, row) {
  	return context.getData(row, 0, row, 11)[0].reduce((a, b) => {
      return +a + +b;
    });
  };

  function buildTable() {
  	return new Handsontable(DOMtable, {
	  	data: buildData(),
	    colHeaders: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'],
	    rowHeaders: ['R', 't° (avg)', 't° (min)', 't° (max)'],
			editor: 'numeric',
	    default: 0,
	    minCols: NUM_COLS,
	    maxCols: NUM_COLS,
	    minRows: NUM_ROWS,
	    maxRows: NUM_ROWS,
	    colWidths: 40,
	    afterChange: function() {
	    	updateClimatogram();
	    }
	  });
  }

  function saveJson(values) {
  	let state = btoa(escape(JSON.stringify(values)));

  	history.pushState({v: state}, document.title, `?v=${ state }`);
  }

  function loadJson() {
  	if(!queryParams.v) return;

  	let values = JSON.parse(unescape(atob(queryParams.v.replace(/\/$/, ''))));
  	let data = values.data;

  	delete values.el;
  	delete values.data;

  	editor.setValue(values);
  	table.loadData([data.precipitation, data.meanTemperature]);
  }

  function parseQuery() {
    let match;
		let pl = /\+/g;
    let search = /([^&=]+)=?([^&]*)/g;
    let decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); };
    let query = window.location.search.substring(1);
    let urlParams = {};

    while (match = search.exec(query)) {
			urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams;
  }

  function saveClimatogramme() {
  	let options = extractValues();
  	let climatogrammeName = `climatogramme-${ dashify(options.primaryTitle) }`;

  	switch(options.saveImageAs) {
  		case 'PNG':
				saveClimatogrammePng(climatogrammeName);
  			break;
			case 'SVG':
				saveClimatogrammeSvg(climatogrammeName);
				break;
			default:
				alert('Unknown type');
  	}
  }

  function saveClimatogrammeSvg(climatogrammeName) {
  	saveAs(new Blob([DOMresult.innerHTML], {type:'application/svg+xml'}), `${ climatogrammeName }.svg`)
  }

  function saveClimatogrammePng(climatogrammeName) {
	  let imgSrc = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(DOMresult.innerHTML)));
		let image = new Image();

		image.src = imgSrc;

	  image.onload = function() {
		  let canvas = document.createElement('canvas');
		  let context = canvas.getContext('2d');

		  canvas.width = image.width;
		  canvas.height = image.height;
		  context.drawImage(image, 0, 0);


			canvas.toBlob(function(blob) {
			  saveAs(blob, `${ climatogrammeName }.png`)
			});
		}
  }

  function dashify(str) {
  	return str.replace(/\s/g, '-');
  }
});




