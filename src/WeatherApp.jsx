import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThermometer,
  WiStrongWind,
} from "react-icons/wi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import "./App.css";

const API_KEY = "f1cd684e19dbb07c8abd73b512e9410d";

const WeatherApp = () => {
  const [city, setCity] = useState("Dushanbe");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true";
  });
  const [unit, setUnit] = useState(() => {
    const savedUnit = localStorage.getItem("unit");
    return savedUnit || "metric";
  });
  const [favorites, setFavorites] = useState(() => {
    const savedFavs = localStorage.getItem("favorites");
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      setWeather(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      setForecast(forecastResponse.data.list.filter((item, idx) => idx % 8 === 0));
    } catch (error) {
      toast.error("Shahar topilmadi yoki tarmoqda xatolik.");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      setWeather(weatherResponse.data);

      // ✅ inputga shahar nomini avtomatik joylash
      setCity(weatherResponse.data.name);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      setForecast(forecastResponse.data.list.filter((item, idx) => idx % 8 === 0));
    } catch (error) {
      toast.error("Geolokatsiya bo'yicha ob-havo olishda xatolik.");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Faqat sahifa birinchi yuklanganda joylashuvdan ob-havo olish
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchWeather(city);
        }
      );
    } else {
      fetchWeather(city);
    }
  }, []
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("unit", unit);
    fetchWeather(city); // ❗️Unit o‘zgarsa, qayta yuklash
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const toggleFavorite = () => {
    if (!weather) return;
    const exists = favorites.find((f) => f.id === weather.id);
    if (exists) {
      setFavorites(favorites.filter((f) => f.id !== weather.id));
    } else {
      setFavorites([...favorites, { id: weather.id, name: weather.name }]);
    }
  };

  const renderIcon = (main) => {
    const animProps = { y: [0, -10, 0] };
    const transition = { repeat: Infinity, duration: 2 };

    switch (main) {
      case "Clear":
        return <motion.div animate={animProps} transition={transition}><WiDaySunny size={64} /></motion.div>;
      case "Clouds":
        return <motion.div animate={animProps} transition={transition}><WiCloudy size={64} /></motion.div>;
      case "Rain":
        return <motion.div animate={animProps} transition={transition}><WiRain size={64} /></motion.div>;
      case "Snow":
        return <motion.div animate={animProps} transition={transition}><WiSnow size={64} /></motion.div>;
      default:
        return <motion.div animate={animProps} transition={transition}><WiDaySunny size={64} /></motion.div>;
    }
  };

  return (
    <div className={darkMode ? "app-container dark" : "app-container light"}>
      <ToastContainer />
      <div className="top-bar">
        <div className="mode-toggle">
          <label className="switch">
            <motion.input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              whileTap={{ scale: 0.9 }}
            />
            <span className="slider round"></span>
          </label>
          <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
        </div>

        <div className="unit-toggle">
          <button
            onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
            className="unit-button"
          >
            {unit === "metric" ? "°C" : "°F"}
          </button>
        </div>
      </div>

      <motion.div
        key={weather ? weather.name : "empty"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="weather-card"
      >
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Shahar nomi"
            className="search-input"
          />
          <button type="submit" className="search-button">Qidirish</button>
        </form>

        {loading ? (
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            🔄
          </motion.div>
        ) : weather ? (
          <div className="weather-info">
            <h2>
              {weather.name}, {weather.sys.country}{" "}
              <button onClick={toggleFavorite} className="fav-button">
                {favorites.find((f) => f.id === weather.id) ? "★" : "☆"}
              </button>
            </h2>
            {renderIcon(weather.weather[0].main)}
            <p className="description">{weather.weather[0].description}</p>
            <div className="weather-details">
              <div className="detail">
                <WiThermometer size={32} />
                <span>
                  {weather.main.temp}°{unit === "metric" ? "C" : "F"}
                </span>
              </div>
              <div className="detail">
                <WiStrongWind size={32} />
                <span>{weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</span>
              </div>
            </div>

            <div className="forecast">
              <h3>5 kunlik prognoz</h3>
              <div className="forecast-list">
                {forecast.map((f) => (
                  <div key={f.dt} className="forecast-item">
                    <p>{new Date(f.dt * 1000).toLocaleDateString()}</p>
                    {renderIcon(f.weather[0].main)}
                    <p>{f.weather[0].description}</p>
                    <p>{f.main.temp}°{unit === "metric" ? "C" : "F"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>Ma'lumot mavjud emas</p>
        )}

        {favorites.length > 0 && (
          <div className="favorites">
            <h3>Sevimli shaharlar</h3>
            <div className="fav-list">
              {favorites.map((fav) => (
                <button
                  key={fav.id}
                  className="fav-city-button"
                  onClick={() => {
                    setCity(fav.name);
                    fetchWeather(fav.name);
                  }}
                >
                  {fav.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WeatherApp;
