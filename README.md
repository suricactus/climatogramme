Climatogramme.js
===
Simple online tool for drawing climatograms.

### What is climatogram
Climatogram or climate chart is type of chart, showing the precipitation and mean temperature month by month. It's widely used by people involved in earth sciences. It looks like this:

![alt text](http://i.imgur.com/edQTPtN.png "Logo Title Text 1")

### About
This repository contains two main modules:

##### climatogramme.js
Function for drawing climatograms. It get single argument which is an object containing settings and data:

```js
let climatogramme = new Climatogramme(options)
```
All options with defaults are listed below:
```js
{
	el: null, // containing element
	width: 400, // width of the generated image
	height: 600, // height of the generated image
	primaryTitle: '', // Title of the climatogram
	marginTop: 40,
	marginLeft: 40,
	marginRight: 40,
	marginBottom: 40,
	distanceBars: 0.1, // what portion of bars width to be set as distance
	precipitationBufferUp: 20, // minimum units to be set empty above precipitation bars
	temperatureBufferUp: 20, // minimum units to be set empty below temperature lines
	temperatureBufferDown: 10, // minimum units to be set empty above temperature lines
	labelTemperature: '°C',
	labelPrecipitation: 'mm',
	labelMeanTemperature: 'mean t',
	labelTotalPrecipitation: 'precipitation',
	labelAplitudeTemperature: 't aplitude',
	data: null, // data, see below
	whiteBackground: true // set white or transparent background
}
```
And data format:
```js
{
    precipitation: [/* twelve month of data */],
    meanTemperature: [/* twelve month of data */],
}
```
##### Climatogramme UI
Interface to build climatograms using `climatogramme.js`. Ability to save current data in the URL and downloading climatogram as SVG or PNG. See the demos below.
### Browsers
Tested in:
 - FF 44
 - GC 47
### Demo
[Empty demo](http://suricactus.github.io/climatogramme/) |
[Demo with data](http://suricactus.github.io/climatogramme/?v=JTdCJTIycHJpbWFyeVRpdGxlJTIyJTNBJTIyJXUwNDQxJXUwNDQyLiUyMCV1MDQxMiV1MDQzNSV1MDQ0MCV1MDQ0NSV1MDQzRSV1MDQ0RiV1MDQzRCV1MDQ0MSV1MDQzQSUyMCUyODEyMiUyMCV1MDQzQyUyMCV1MDQzRC4ldTA0MzIuJTI5JTIyJTJDJTIyd2lkdGglMjIlM0E0MDAlMkMlMjJoZWlnaHQlMjIlM0E2MDAlMkMlMjJtYXJnaW5Ub3AlMjIlM0E0MCUyQyUyMm1hcmdpblJpZ2h0JTIyJTNBNDAlMkMlMjJtYXJnaW5Cb3R0b20lMjIlM0E0MCUyQyUyMm1hcmdpbkxlZnQlMjIlM0E0MCUyQyUyMnByZWNpcGl0YXRpb25CdWZmZXJVcCUyMiUzQTEwJTJDJTIydGVtcGVyYXR1cmVCdWZmZXJVcCUyMiUzQTIlMkMlMjJ0ZW1wZXJhdHVyZUJ1ZmZlckRvd24lMjIlM0ExMCUyQyUyMmRpc3RhbmNlQmFycyUyMiUzQTAuMSUyQyUyMmxhYmVsVGVtcGVyYXR1cmUlMjIlM0ElMjIlQjBDJTIyJTJDJTIybGFiZWxQcmVjaXBpdGF0aW9uJTIyJTNBJTIybW0lMjIlMkMlMjJsYWJlbE1lYW5UZW1wZXJhdHVyZSUyMiUzQSUyMm1lYW4lMjB0JTIyJTJDJTIybGFiZWxUb3RhbFByZWNpcGl0YXRpb24lMjIlM0ElMjJwcmVjaXBpdGF0aW9uJTIyJTJDJTIybGFiZWxBcGxpdHVkZVRlbXBlcmF0dXJlJTIyJTNBJTIydCUyMGFtcGxpdHVkZSUyMiUyQyUyMndoaXRlQmFja2dyb3VuZCUyMiUzQXRydWUlMkMlMjJzYXZlSW1hZ2VBcyUyMiUzQSUyMlNWRyUyMiUyQyUyMmVsJTIyJTNBJTdCJTdEJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnByZWNpcGl0YXRpb24lMjIlM0ElNUIlMjI0JTIyJTJDJTIyNCUyMiUyQyUyMjMlMjIlMkMlMjI0JTIyJTJDJTIyNyUyMiUyQyUyMjIyJTIyJTJDJTIyMjclMjIlMkMlMjIyNiUyMiUyQyUyMjEzJTIyJTJDJTIyOCUyMiUyQyUyMjclMjIlMkMlMjI0JTIyJTVEJTJDJTIybWVhblRlbXBlcmF0dXJlJTIyJTNBJTVCJTIyLTUwLjElMjIlMkMlMjItNDQuMyUyMiUyQyUyMi0zMC4yJTIyJTJDJTIyLTEzLjElMjIlMkMlMjIxLjUlMjIlMkMlMjIxMi42JTIyJTJDJTIyMTUuMTAlMjIlMkMlMjIxMC44JTIyJTJDJTIyMi40JTIyJTJDJTIyLTE0LjYlMjIlMkMlMjItMzYuOCUyMiUyQyUyMi00Ni41JTIyJTVEJTdEJTdE)
### Licence
MIT
### Contributions
Thank you in advance!
