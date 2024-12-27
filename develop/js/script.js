const apiKey = "6892d49b565ab76b6c9957db35235c42"; // replace with your API key
const baseURL = "https://api.openweathermap.org/data/2.5";

const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const historyList = document.getElementById("historyList");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");

// fetch coordinates by city name
function getCoordinates(city) {
  const url = `${baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) throw new Error("City not found");
      return { lat: data[0].lat, lon: data[0].lon };
    });
}

// fetch weather data
function getWeather(lat, lon) {
  const url = `${baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  return fetch(url).then((response) => response.json());
}

// display weather data
function displayWeather(data) {
  const current = data.list[0];
  currentWeather.innerHTML = `
    <h2>${data.city.name}</h2>
    <p>Temperature: ${current.main.temp}°C</p>
    <p>Humidity: ${current.main.humidity}%</p>
    <p>Wind Speed: ${current.wind.speed} m/s</p>
  `;
}

// display 5-day forecast
function displayForecast(data) {
  const daily = data.list.filter((_, index) => index % 8 === 0);
  forecast.innerHTML = daily
    .map(
      (day) => `
      <div>
        <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
        <p>Temp: ${day.main.temp}°C</p>
        <p>Humidity: ${day.main.humidity}%</p>
        <p>Wind: ${day.wind.speed} m/s</p>
      </div>
    `
    )
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

// update history
function updateHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  historyList.innerHTML = history.map((city) => `<li>${city}</li>`).join("");
}

// event listeners
searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return;
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
