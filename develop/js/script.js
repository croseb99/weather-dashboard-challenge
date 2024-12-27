const apiKey = "59b7c62edd1d1d7b4c7d76a321431793";
const geoBaseURL = "https://api.openweathermap.org/geo/1.0/direct";
const weatherBaseURL = "https://api.openweathermap.org/data/2.5/forecast";

const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const historyList = document.getElementById("historyList");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");

// fetch coordinates by city name
function getCoordinates(city) {
  const url = `${geoBaseURL}?q=${city}&limit=1&appid=${apiKey}`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response (Coordinates):", data);
      if (data.length === 0) {
        alert("City not found. Please check the spelling and try again.");
        throw new Error("City not found");
      }
      return { lat: data[0].lat, lon: data[0].lon };
    })
    .catch((error) => {
      console.error("Error fetching coordinates:", error);
      alert("Failed to fetch coordinates. Please try again later.");
    });
}

// fetch weather data
function getWeather(lat, lon) {
  const url = `${weatherBaseURL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response (Weather):", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      alert("Failed to fetch weather data. Please try again later.");
    });
}

// display current weather
function displayWeather(data) {
  const current = data.list[0];
  const weatherIcon = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  currentWeather.innerHTML = `
    <div class="weather-card">
      <h2>${data.city.name} - ${new Date(
    current.dt_txt
  ).toLocaleDateString()}</h2>
      <img src="${weatherIcon}" alt="${current.weather[0].description}" />
      <p>Temperature: ${current.main.temp}°C</p>
      <p>Humidity: ${current.main.humidity}%</p>
      <p>Wind Speed: ${current.wind.speed} m/s</p>
    </div>
  `;
}

// display 5-day forecast
function displayForecast(data) {
  const daily = data.list.filter((_, index) => index % 8 === 0);
  forecast.innerHTML = daily
    .map((day) => {
      const weatherIcon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
      return `
      <div class="forecast-card">
        <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
        <img src="${weatherIcon}" alt="${day.weather[0].description}" />
        <p>Temp: ${day.main.temp}°C</p>
        <p>Humidity: ${day.main.humidity}%</p>
        <p>Wind: ${day.wind.speed} m/s</p>
      </div>
    `;
    })
    .join("");
}

// save to history
function saveHistory(city) {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("history", JSON.stringify(history));
    updateHistory();
  }
}

// saved history functionality
function handleHistoryClick(event) {
  const city = event.target.textContent;
  if (city) {
    getCoordinates(city)
      .then(({ lat, lon }) => getWeather(lat, lon))
      .then((data) => {
        displayWeather(data);
        displayForecast(data);
      })
      .catch((error) => alert(error.message));
  }
}

// update history
function updateHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  historyList.innerHTML = history
    .map((city) => `<li class="history-item">${city}</li>`)
    .join("");

  // Add event listeners to history items
  const historyItems = document.querySelectorAll(".history-item");
  historyItems.forEach((item) => {
    item.addEventListener("click", handleHistoryClick);
  });
}

// event listeners
searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  getCoordinates(city)
    .then(({ lat, lon }) => getWeather(lat, lon))
    .then((data) => {
      displayWeather(data);
      displayForecast(data);
      saveHistory(city);
    })
    .catch((error) => alert(error.message));
});

// initialize history on load
updateHistory();
