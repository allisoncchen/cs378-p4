import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css'; // This imports bootstrap css styles. You can use bootstrap or your own classes by using the className attribute in your elements.

import { useState } from 'react'; 
// import Button from 'react-bootstrap/Button';

// import { Alert } from 'react-bootstrap'; 

// import { fetchWeatherApi } from 'openmeteo'; 
// Menu data. An array of objects where each object represents a menu item. Each menu item has an id, title, description, image name, and price.
// You can use the image name to get the image from the images folder.
import React, { useEffect } from 'react';

// import React, { useEffect, useState } from 'react';
// import './App.css';

function App() {
  const [temperatureData, setTemperatureData] = useState("Loading...");
  const [city, setCity] = useState({ name: "Austin", lat: 30.2672, lon: -97.7431 });
  const [currentTime, setCurrentTime] = useState("");
  const [currentWeather, setCurrentWeather] = useState("");
  const [userInput, setUserInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
      async function getWeather(lat, lon) {
          try {
              const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m`;
              const response = await fetch(apiUrl);
              if (!response.ok) {
                  throw new Error("Weather data not available");
              }
              const data = await response.json();
              
              const temperatures = data.hourly.temperature_2m;
              let output = "";
              const times = data.hourly.time; // Access the timestamps from the API

              temperatures.slice(0, 24).forEach((temp, index) => {
                const tempFahrenheit = (temp * 9/5) + 32;
                const dateTime = new Date(times[index]);
                const date = dateTime.toLocaleDateString([], { month: 'long', day: 'numeric' });
                const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                output += `${date}, ${time}: ${tempFahrenheit.toFixed(1)}°F\n`;
              });
              setTemperatureData(output);
              setCurrentTime(new Date().toLocaleTimeString());
              setCurrentWeather(`${(data.current_weather.temperature * 9/5 + 32).toFixed(1)}°F`);
              setErrorMessage("");
          } catch (error) {
              setErrorMessage("Failed to fetch weather data. Please try again.");
          }
      }
      
      getWeather(city.lat, city.lon);
  }, [city]);

  async function handleSearch() {
      const apiUrl = `https://nominatim.openstreetmap.org/search?city=${userInput}&format=json`;
      try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          if (data.length === 0) {
              setErrorMessage(`Latitude and longitude for ${userInput} not found!`);
              return;
          }
          const { lat, lon } = data[0];
          setCity({ name: userInput, lat: parseFloat(lat), lon: parseFloat(lon) });
          setUserInput("");
          setErrorMessage("");
      } catch (error) {
          setErrorMessage("Error fetching location data. Please try again.");
      }
  }

  return (
    <div className="container">
      <h1>What's the Weather Today?</h1>
      <h2>Weather in {city.name} ({currentTime})</h2>
      <h2>Current: {currentWeather}</h2>
      <div className="button-group">
        <button onClick={() => setCity({ name: "Austin", lat: 30.2672, lon: -97.7431 })}>Austin</button>
        <button onClick={() => setCity({ name: "Houston", lat: 29.7604, lon: -95.3698 })}>Houston</button>
        <button onClick={() => setCity({ name: "Dallas", lat: 32.7767, lon: -96.7970 })}>Dallas</button>
      </div>
      <div className="search-bar">
        <input 
          type="text" 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)} 
          placeholder="Enter city name" 
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <pre>{temperatureData}</pre>
    </div>
  );
  
}

export default App;