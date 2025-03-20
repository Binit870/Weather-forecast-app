import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { HashRouter as Router } from "react-router-dom";


// OpenWeather API Key
const WEATHER_API_KEY = "b1acf5ad58207f82b893cc4d3b3d7258";
// Unsplash API Key
const UNSPLASH_ACCESS_KEY = "X5QNK00W7x-dpLRsdrYinUA6_mAUM8NMMIqhdlgBjoY";

const WeatherForecast = () => {
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState("Jamshedpur");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weatherCondition, setWeatherCondition] = useState(""); // For background image
  const [backgroundImage, setBackgroundImage] = useState(""); // Background image URL

  // Function to fetch weather data
  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${WEATHER_API_KEY}`
      );
      if (response.data.cod !== "200") {
        setError("City not found. Please try again.");
        setForecast([]);
        setWeatherCondition(""); // Reset background if city not found
      } else {
        
        // ✅ Create a map to store unique days
        const uniqueDays = new Map();

        // ✅ Filter forecast for the next 5 days (including today)
        const fiveDayForecast = response.data.list.filter((reading) => {
          const date = reading.dt_txt.split(" ")[0]; // Extract date (YYYY-MM-DD)
          if (!uniqueDays.has(date)) {
            uniqueDays.set(date, true);
            return true;
          }
          return false;
        });

        // ✅ Slice to ensure we only get 5 days (today + next 4)
        setForecast(fiveDayForecast.slice(0, 5));

        // ✅ Set background based on today's weather
        setWeatherCondition(response.data.list[0].weather[0].main);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [city]);

  // Function to fetch background image based on weather condition
  const fetchBackgroundImage = useCallback(async () => {
    if (!weatherCondition) return; // Avoid API call if no condition is set

    const query = `${weatherCondition} weather`; // Example: "Rainy weather"
    try {
      const response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      setBackgroundImage(response.data.urls.regular);
    } catch (error) {
      console.error("Error fetching background image:", error);
      setBackgroundImage("/default-weather.jpg"); // Use fallback image
    }
  }, [weatherCondition]);

  // Fetch weather on first load + when city changes
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Fetch background image when weather condition changes
  useEffect(() => {
    fetchBackgroundImage();
  }, [fetchBackgroundImage]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay for Better Text Visibility */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-6xl w-full bg-white/20 backdrop-blur-md rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-white mb-6">
          5-Day Weather Forecast
        </h1>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center mb-6 gap-3">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="w-full sm:w-80 p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition bg-white text-gray-800"
          />
          <button
            onClick={fetchWeatherData}
            className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
          >
            Get Forecast
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {/* Loading Animation */}
        {loading ? (
          <div className="text-center text-white font-semibold text-lg animate-pulse">
            Loading weather data...
          </div>
        ) : (
          <>
            {/* ✅ Display 5-Day Forecast (Including Today) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {forecast.map((day) => (
                <div
                  key={day.dt}
                  className="p-6 rounded-lg shadow-lg text-center transition transform hover:scale-105 hover:shadow-2xl bg-white/30 backdrop-blur-lg"
                >
                  <p className="font-bold text-white">
                    {new Date(day.dt_txt).toLocaleDateString()}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                    className="mx-auto w-24"
                  />
                  <p className="text-3xl font-bold text-white">
                    {Math.round(day.main.temp)}°C
                  </p>
                  <p className="capitalize text-gray-200 text-lg">
                    {day.weather[0].description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherForecast;
