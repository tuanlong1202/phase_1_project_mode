const DATE_Y_M_D = 'YMD';
const DATE_D_M_Y = 'DMY';
const DATE_M_D_Y = 'MDY';

document.addEventListener('DOMContentLoaded', function(){
	getWOEID('New York');
})

document.getElementById('search_form').addEventListener('submit', function(e){
	e.preventDefault();
	if (this.search.value != '') {
		getWOEID(this.search.value);
		this.reset();
	}
})

function callBack(strWOEID) {
	locationSearch(strWOEID);
}

function locationSearch(woeid){
	let url = `https://meta-weather.vercel.app/api/location/${woeid}/`;
	fetch(url)
		.then(response=>response.json())
		.then(function(result) {
			renderTitle(result);
			renderShowPanel(result);
			renderSource(result.sources);
		})
		.catch(error=>console.log(error.message));
}

function renderTitle(obj) {
	let divTitle = document.getElementById('title');
	divTitle.innerHTML = '';
	divTitle.appendChild(renderTitleLeft(obj));
	divTitle.appendChild(renderTitleRight(obj));
}

function renderTitleLeft(obj) {
	let divLeft = document.createElement('div');
	divLeft.className = 'left';
	let h1Title = document.createElement('h1');
	h1Title.textContent = obj.title;
	h1Title.addEventListener('click',function(){
		getWOEID(obj.title);
	})
	let spanParent = document.createElement('span');
	spanParent.textContent = obj.parent.title;
	divLeft.appendChild(h1Title);
	divLeft.appendChild(spanParent);
	return divLeft;
}

function renderTitleRight(obj) {
	let divRight = document.createElement('div');
	divRight.className = 'right';
	let dl = document.createElement('dl');
	dl.className = 'dl-horizontal pull-right';
	dl.appendChild(dt('Time'));
	dl.appendChild(dd(getTime(obj.time)));
	dl.appendChild(dt('Sunrise'));
	dl.appendChild(dd(getTime(obj.sun_rise)));
	dl.appendChild(dt('Sunset'));
	dl.appendChild(dd(getTime(obj.sun_set)));
	divRight.appendChild(dl);
	return divRight;
}

function renderShowPanel(obj) {
	let divShowPanel = document.getElementById('show_panel');
	divShowPanel.innerHTML = '';
	divShowPanel.appendChild(renderRowCell(obj));
}

function renderRowCell(obj) {
	let divRow = document.createElement('div');
	divRow.className = 'row';
	let arrConsolidated_weather = obj.consolidated_weather;
	arrConsolidated_weather.forEach(ele => {
		let divCell = document.createElement('div');
		divCell.className = 'cell';
		let h2Title = document.createElement('h2');
		h2Title.textContent = dateDeterminate(ele.applicable_date); 
		h2Title.addEventListener('click', function(){
			showWeatherOnSingleDay(obj,ele);
		})
		let dl = document.createElement('dl');
		let dt1 = document.createElement('dt');
		dt1.className = 'hidden-xs hidden-sm';
		dt1.textContent = 'Weather';
		let dd1 = document.createElement('dd');
		dd1.className = 'weatherstate';
		dd1['data-title'] = 'Forecasts';
		let div1 = document.createElement('div');
		div1.className = 'state-icon-lrg state-' + ele.weather_state_abbr;
		let span1 = document.createElement('span');
		span1.textContent = ele.weather_state_name;
		dd1.appendChild(div1);
		dd1.appendChild(span1);
		let dt2 = document.createElement('dt');
		dt2.className = 'hidden-xs hidden-sm';
		dt2.textContent = 'Temperature';
		let dd2 = document.createElement('dd');
		dd2.innerHTML = 'Max: ' + Math.round(ele.max_temp) + '°C<br>' + 'Min: ' + Math.round(ele.min_temp) + '°C';
		let dt3 = document.createElement('dt');
		dt3.className = 'hidden-xs hidden-sm';
		dt3.textContent = 'Wind';
		let dd3 = document.createElement('dd');
		dd3.className = 'wind';
		let span3 = document.createElement('span');
		span3.className = 'dir dir-' + ele.wind_direction_compass.toLowerCase();
		span3.title = ele.wind_direction_compass;
		dd3.appendChild(span3);
		let txtNode3 = document.createTextNode(parseInt(ele.wind_speed) + ' mph');
		dd3.appendChild(txtNode3);

		dl.appendChild(dt1);
		dl.appendChild(dd1);
		dl.appendChild(dt2);
		dl.appendChild(dd2);
		dl.appendChild(dt3);
		dl.appendChild(dd3);
		dl.appendChild(dt('Humidity', 'humidity'));
		dl.appendChild(dd(ele.humidity + '%'));
		dl.appendChild(dt('Visibility','visibility'));
		dl.appendChild(dd(ele.visibility.toFixed(1) + ' miles'));
		dl.appendChild(dt('Pressure','dewpoint'));
		dl.appendChild(dd(ele.air_pressure + ' mb'));
		dl.appendChild(dt('Confidence','predictability'));
		dl.appendChild(dd(ele.predictability + '%'));

		divCell.appendChild(h2Title);
		divCell.appendChild(dl);

		divRow.appendChild(divCell);
	});

	if (obj.consolidated_weather.length == 1) {
		// showing a single day
		fetchWeatherOnDay(obj); //
	}
	return divRow;
}

function dt(str, className='') {
	let dt = document.createElement('dt');
	if (className != '') {
		dt.className = className;
	}
	dt.textContent = str;
	return dt;
}

function dd(str, className='') {
	let dd = document.createElement('dd');
	if (className != '') {
		dd.className = className;
	}
	dd.textContent = str;
	return dd;
}

function getTime(strTime){
	let arrDateTime = strTime.split('T');
	let arrTime = arrDateTime[1].split(':',2);
	return parseInt(arrTime[0]) + ':' + parseInt(arrTime[1]);
}

function getDate(strTime) {
	let dteDate = strTime.split('T');
	return dteDate[0];
}

function getDateWithFormat(strTime,format = DATE_Y_M_D, separator = '-') {
	let dteDate = getDate(strTime);
	let arrDate = dteDate.split('-');
	switch (format) {
		case DATE_M_D_Y :
			return arrDate[1] + separator + arrDate[2] + separator + arrDate[0];
		case DATE_D_M_Y :
			return arrDate[2] + separator + arrDate[1] + separator + arrDate[0];
		case DATE_Y_M_D :
			return arrDate[0] + separator + arrDate[1] + separator + arrDate[2];
		default :
			return dteDate;

	}
}

function getWOEID(strLocation) {
	let url = `https://meta-weather.vercel.app/api/location/search/?query=${strLocation}`;
	fetch(url)
		.then(response=>response.json())
		.then((result)=>{
			callBack(result[0].woeid);
		})
		.catch((error)=>{
			console.log(error.message);
		});
}

function dateDeterminate(dteDate) {
	let arrDate = dteDate.split('-'); // dteDate : YYYY-MM-DD
	let strDateCompare = arrDate[0] + '-' + parseInt(arrDate[1]) + '-' + arrDate[2]; // Without 0 digit on month
	let dteCompare = new Date(strDateCompare);
	let today = new Date();
	let dteToday = new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate());

	if (dteCompare > dteToday) {
		let dteTomorrow = new Date(dteToday);
		dteTomorrow.setDate(dteTomorrow.getDate() + 1) ;
		if (dteCompare > dteTomorrow) {
			let str = dteCompare.toString();
			let arrDateCompare = str.split(' ');
			return arrDateCompare[0] + ' ' + arrDateCompare[1] + ' ' + arrDateCompare[2];
		} else {
			return 'Tomorrow'
		}
	} else {
		return 'Today';
	}
}

function renderSource(sources) {
	let divRow = document.createElement('div');
	divRow.className = 'row';
	let divCell = document.createElement('div');
	divCell.className = 'cell';
	let h2Source = document.createElement('h2');
	h2Source.textContent = 'Sources';
	let ul = document.createElement('ul');
	ul.className = 'sources list-unstyled';
	sources.forEach(ele => {
		let li = document.createElement('li');
		let img = document.createElement('img');
		img.src = `https://www.metaweather.com/static/img/sources/${ele.slug}.png`;
		img.alt = ele.title;
		let a = document.createElement('a');
		a.href = ele.url;
		a.textContent = ele.title;
		li.appendChild(img);
		li.appendChild(document.createTextNode(' '));
		li.appendChild(a);
		ul.appendChild(li);
	})
	divCell.appendChild(h2Source);
	divCell.appendChild(ul);
	divRow.appendChild(divCell);
	document.getElementById('show_panel').appendChild(divRow);
}

function fetchWeatherOnDay(obj) {
	let woeid = obj.woeid;
	let dteApplicable =  obj.consolidated_weather[0].applicable_date;
	arrDteApplicableDate = dteApplicable.split('-');
	let url = `https://meta-weather.vercel.app/api/location/${woeid}/${arrDteApplicableDate[0]}/${arrDteApplicableDate[1]}/${arrDteApplicableDate[2]}/`

	fetch(url)
	.then(response =>response.json())
	.then(function(result){
		renderWeatherOnDay(result);
	})
	.catch(err => {
		console.log(err.message);
	});
	
}

function renderWeatherOnDay(Items) {
	let table = document.createElement('table');
	let row1 = document.createElement('tr');
	let row2 = document.createElement('tr');
	let row3 = document.createElement('tr');
	Items.forEach(item=>{
		let td1 = document.createElement('td');
		let span1 = document.createElement('span');
		span1.className = `state-icon-graph state-${item.weather_state_abbr}`;
		let createDate = new Date(item.created);
		let applicableDate = new Date(item.applicable_date);
		span1.title = `Weather for ${applicableDate} as forecast at ${createDate}.`
		td1.appendChild(span1);
		let td2 = document.createElement('td');
		td2.className = 'tempgraph';
		td2.style = `padding-top:${Math.round(item.max_temp - item.min_temp)}em`
		td2.appendChild(document.createTextNode(Math.round(item.min_temp) + '°C' + ' - ' + Math.round(item.max_temp) + '°C'));
		let div2 = document.createElement('div');
		div2.style = `height:${Math.round((item.max_temp - item.min_temp)*10)}px;background: linear-gradient(to bottom, #fcaf51 0%, #ffd86b 100%);`;
		td2.appendChild(div2);
		let td3 = document.createElement('td');
		td3.className = 'wind';
		let span3 = document.createElement('span');
		span3.className = `dir dir-${item.wind_direction_compass.toLowerCase()}`;
		span3.title = item.wind_direction_compass;
		td3.appendChild(span3);
		td3.appendChild(document.createTextNode(parseInt(item.wind_speed) + ' mph'))

		row1.appendChild(td1);
		row2.appendChild(td2);
		row3.appendChild(td3);
	})
	table.appendChild(row1);
	table.appendChild(row2);
	table.appendChild(row3);
	let div = document.createElement('div');
	div.appendChild(table);
	let show_panel_row = document.querySelector('#show_panel .row');
	show_panel_row.appendChild(div);
}

function showWeatherOnSingleDay(obj,ele) {
	renderTitle(obj);
	obj.consolidated_weather = obj.consolidated_weather.filter(item=>item.id==ele.id);
	renderShowPanel(obj);
	renderSource(obj.sources);
}