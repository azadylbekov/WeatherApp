const apiKey = '959d8a11e2dd7cf1c1a6b8a271b18d63';
const form = document.getElementById('form-control');
const inputCity = document.getElementById('input-city');
const warning = document.getElementById('alert-warning');
const todayWeather = document.getElementById('today-weather-block');
const weatherRow = document.querySelector('.weather-row');
const closeWarning = document.getElementById('close-warning');
let weatherNow, weatherWeeks, timeNow;
let city, country, celcius, humidity, pressure, cloudiness, desc, wind, icon;

let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thurdsday', 'Friday', 'Saturday'];

let icons = {
	"01d": "la-sun",
	"02d": "la-cloud-sun",
	"03d": "la-cloud",
	"04d": "la-cloud-sun",
	"09d": "la-cloud-showers-heavy",
	"10d": "la-cloud-sun-rain",
	"11d": "la-poo-storm",
	"13d": "la-snowflake",
	"50d": "la-wind",
	"01n": "la-moon",
	"02n": "la-cloud-sun",
	"03n": "la-cloud",
	"04n": "la-cloud-sun",
	"09n": "la-cloud-showers-heavy",
	"10n": "la-cloud-sun-rain",
	"11n": "la-poo-storm",
	"13n": "la-snowflake",
	"50n": "la-wind"
}

form.addEventListener('submit', getWeather);

async function getWeather(e) {
	e.preventDefault();
	if (inputCity.value != '') {
		alertWarning(false);

		weatherNow = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${inputCity.value}&units=metric&appid=${apiKey}`)
			.then(data => {
				if (data.ok) {
					return data.json();
				} else {
					alertWarning(false, inputCity.value);
					throw new Error('Something went wrong');
					return;
				}
			})
			.then(data => weatherNow = data)
			.catch(err => console.log(err));

		if (weatherNow != undefined) {
			weatherWeeks = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${weatherNow.coord.lat}&lon=${weatherNow.coord.lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`)
				.then(data => {
					if (data.ok) {
						return data.json();
					} else {
						throw new Error('Something went wrong');
					}
				})
				.then(data => {
					console.log(data);
					weatherWeeks = data;
					processData(weatherNow, weatherWeeks, weatherWeeks);
				})
				.catch(err => console.log(err));

			console.log(weatherNow);
		} else {
			console.log('Something went wrong');
		}


	} else {
		alertWarning(true);
	}
}

function processData(current, weeks, currentTime) {
	city = current.name;
	country = current.sys.country;
	celcius = current.main.temp;
	wind = current.wind.speed;
	humidity = current.main.humidity;
	pressure = current.main.pressure;
	cloudiness = current.clouds.all;
	desc = current.weather[0].description;
	icon = getIcon(current.weather[0].icon);
	weekDays = weeks.daily;
	timeNow = currentTime.timezone_offset;


	renderToday();
	renderWeeks();
}

function renderToday() {
	let output = `
		<div class="today-weather">
		<h2 class='loc-heading'>${city}, ${country}</h2>
		<h3 class='temperature'>${celcius.toFixed()} °C</h3>
		<i id='weather-today-icon' class="las ${icon}"></i>
		<h3 class='weather-desc'>${desc}</h3>
		<h3 class="date">${getCurrentTime(timeNow)}</h3>
		<div class="gen-info-row">
			<div class="info-item">Wind ${wind} m/s</div>
			<div class="info-item">Pressure ${pressure} hPa</div>
			<div class="info-item">Humidity ${humidity}%</div>
			<div class="info-item">Cloudiness ${cloudiness}%</div>
		</div>
		</div>`;
	setTimeout(() => {
		todayWeather.style.opacity = 0;
		todayWeather.innerHTML = output;
	}, 250)
	setTimeout(() => {
		todayWeather.style.opacity = 1;
	}, 400);
}

function renderWeeks() {
	// console.log(weatherWeeks);
	weatherRow.innerHTML = '';
	for (let i = 1; i < weatherWeeks.daily.length - 1; i++) {
		// console.log(weatherWeeks.daily[i]);
		// console.log(weatherWeeks.daily[i].weather[0]);
		let output = `
		<div class="weather-item-cover">
			<div class="weather-item">
				<h3 class='item-heading'>${getWeekDay(i)}</h3>
				<i class="weather-icon las ${getIcon(weekDays[i].weather[0].icon)}"></i>
				<h4 class='weather-item-temp'>${weekDays[i].temp.day.toFixed()} °C</h4>
				<h3 class='weather-item-info'>${weekDays[i].weather[0].description}</h3>
			</div>
		</div>`;
		weatherRow.innerHTML += output;
	}
}

function getCurrentTime(offset) {
	let shiftTime = (offset / 60) / 60;
	let date = new Date();
	let hours = date.getUTCHours() + shiftTime;
	hours = (hours < 10 ? '0' : '') + hours;
	let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
	let day = date.getDay();

	return getWeekDay(day) + " " + hours + ":" + minutes;
}


function alertWarning(isHidden, givenCity = '') {
	if (givenCity != '') {
		warning.textContent = givenCity + " was not found!";
		warning.style.height = 'auto';
		warning.style.visibility = 'visible';
		warning.style.padding = '15px';
	}
	else if (isHidden) {
		warning.textContent = "Enter a city name!";
		warning.style.height = 'auto';
		warning.style.visibility = 'visible';
		warning.style.padding = '15px';
	} else {
		warning.textContent = "Enter a city name!";
		warning.style.visibility = 'hidden';
		warning.style.height = '0';
		warning.style.padding = '0';
	}
}

function getWeekDay(dayOfWeek) {
	return daysOfWeek[dayOfWeek];
}

function getIcon(prop) {
	return icons[prop];
}


closeWarning.addEventListener('click', (e) => {
	e.preventDefault();
	alertWarning(false);
})

