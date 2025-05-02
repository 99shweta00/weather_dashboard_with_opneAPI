const apiKey = 'c81dfcd5567cd73b2f4fcf4779524e83'; // Replace with your OpenWeatherMap API Key

// Function to get weather data from OpenWeatherMap API
async function getWeatherData(city, unit = 'metric') {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`
        );
        if (!response.ok) throw new Error("City not found.");
        const data = await response.json();
        renderCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon, unit);
        saveToHistory(city);
    } catch (err) {
        alert(err.message);
    }
}

// Function to render current weather information
function renderCurrentWeather(data) {
    const { name, main, weather, wind, dt } = data;
    document.body.className = weather[0].main.toLowerCase(); // change background class based on weather
    document.getElementById("current-weather").innerHTML = `
        <h2>${name}</h2>
        <p>${new Date(dt * 1000).toLocaleString()}</p>
        <p>${weather[0].description}</p>
        <p>Temp: ${main.temp}°</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind: ${wind.speed} km/h</p>
    `;
}

// Function to get 5-day weather forecast data
async function getForecast(lat, lon, unit) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`
    );
    const forecastData = await res.json();
    const daily = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
    document.getElementById("forecast").innerHTML = daily.map(day => `
        <div class="forecast-card">
            <p>${new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'short' })}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"/>
            <p>${day.main.temp_min}° / ${day.main.temp_max}°</p>
        </div>
    `).join("");
}

// Function to get weather data based on user's geolocation
document.getElementById("geo-btn").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        getWeatherByCoords(latitude, longitude);
    });
});

async function getWeatherByCoords(lat, lon) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    renderCurrentWeather(data);
    getForecast(lat, lon, 'metric');
}

// Function to handle unit toggle (Celsius/Fahrenheit)
document.getElementById("unit-toggle").addEventListener("change", e => {
    const unit = e.target.value;
    const city = document.getElementById("city-input").value || "Mumbai";
    getWeatherData(city, unit);
});

// Function to handle search button click
document.getElementById("search-btn").addEventListener("click", () => {
    const city = document.getElementById("city-input").value;
    if (!city) return alert("Please enter a city.");
    getWeatherData(city);
});

// Function to save search history in localStorage
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        localStorage.setItem("weatherHistory", JSON.stringify(history.slice(0, 5)));
        renderHistory();
    }
}

// Function to render search history
function renderHistory() {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    document.getElementById("history").innerHTML = history.map(city => `
        <button class="history-btn">${city}</button>
    `).join("");
}

// Function to handle clicking a history item
document.getElementById("history").addEventListener("click", e => {
    if (e.target.classList.contains("history-btn")) {
        getWeatherData(e.target.textContent);
    }
});

// Initial render of search history when page loads
renderHistory();
