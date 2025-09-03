"use client";
import { useState } from "react";

interface WeatherData {
  name: string;
  cod?: string | number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
}

interface ForecastData {
  list: ForecastItem[];
  cod: string;
  message: number;
  cnt: number;
}

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const apiKey = "19797197dc030039d6a2322661d273a2";

  const getBackgroundClass = () => {
    if (!weather) return "from-blue-400 to-indigo-600";
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes("cloud")) return "from-gray-500 to-gray-700";
    if (main.includes("rain") || main.includes("drizzle"))
      return "from-blue-700 to-gray-800";
    if (main.includes("snow")) return "from-white to-gray-300";
    if (main.includes("clear")) return "from-yellow-400 to-orange-500";
    return "from-blue-400 to-indigo-600";
  };

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const weatherData: WeatherData = await weatherRes.json();

      if (weatherData.cod === "404" || weatherData.cod === 404) {
        setWeather(null);
        setForecast([]);
        setHasSearched(false);
        setErrorMsg("City not found. Please try another city.");
        setLoading(false);
        return;
      }

      setWeather(weatherData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      const forecastData: ForecastData = await forecastRes.json();

      if (forecastData.cod !== "200") throw new Error("Forecast fetch failed");

      const dailyForecast: ForecastItem[] = forecastData.list.filter(
        (item) => item.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast);
      setHasSearched(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setWeather(null);
      setForecast([]);
      setHasSearched(false);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setHasSearched(false);
    setWeather(null);
    setForecast([]);
    setCity("");
    setErrorMsg("");
  };

  return (
    <main
      className="flex items-center justify-center min-h-screen w-full text-white transition-colors duration-1000"
      style={{
        backgroundImage: !hasSearched ? "url('/weather.png')" : undefined,
        backgroundSize: !hasSearched ? "cover" : undefined,
        backgroundPosition: !hasSearched ? "center" : undefined,
        backgroundAttachment: !hasSearched ? "fixed" : undefined,
      }}
    >
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-screen p-6 ${
          hasSearched ? `bg-gradient-to-br ${getBackgroundClass()}` : ""
        }`}
      >
        {hasSearched && (
          <button
            onClick={handleBack}
            className="absolute top-4 sm:top-6 left-2 sm:left-4 md:left-8 bg-white text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold shadow-md hover:bg-gray-200 transition z-10 text-sm sm:text-base"
          >
            ← Back
          </button>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg text-center">
          🌦 Weather Dashboard <span className="text-sm italic">with Leo</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 mb-6 w-full max-w-md justify-center">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-2 w-full rounded-full focus:outline-none text-black shadow-md bg-white"
          />
          <button
            onClick={fetchWeather}
            className="bg-[#547fdd] hover:bg-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto"
          >
            Search
          </button>
        </div>

        {errorMsg && (
          <p className="text-red-500 mb-4 font-semibold text-center">{errorMsg}</p>
        )}
        {loading && <p className="mb-4 text-lg font-semibold">Loading...</p>}

        {weather && (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-xl text-center w-full max-w-[320px] mb-6 transition-all duration-500">
            <h2 className="text-2xl font-bold">{weather.name}</h2>
            <p className="capitalize text-lg">{weather.weather[0].description}</p>
            <p className="text-5xl font-bold my-2">{Math.round(weather.main.temp)}°C</p>
            <div className="flex justify-center gap-6 mt-4">
              <div>
                <p className="font-semibold">{weather.main.humidity}%</p>
                <p className="text-sm">Humidity</p>
              </div>
              <div>
                <p className="font-semibold">{weather.wind.speed} m/s</p>
                <p className="text-sm">Wind</p>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 py-4 px-2 w-full max-w-5xl">
            {forecast.map((day, index) => {
              const weatherMain = day.weather[0].main.toLowerCase();
              let cardBg = "bg-white/20";
              if (weatherMain.includes("cloud")) cardBg = "bg-gray-300/30";
              if (weatherMain.includes("rain")) cardBg = "bg-blue-300/30";
              if (weatherMain.includes("snow")) cardBg = "bg-white/40";
              if (weatherMain.includes("clear")) cardBg = "bg-yellow-300/30";

              return (
                <div
                  key={index}
                  className={`${cardBg} backdrop-blur-md rounded-2xl p-4 shadow-lg min-w-[140px] sm:w-36 text-center flex-shrink-0 hover:scale-105 transition-transform duration-300`}
                >
                  <p className="font-semibold text-xs sm:text-sm">
                    {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="font-bold text-base sm:text-lg my-1">
                    {Math.round(day.main.temp)}°C
                  </p>
                  <p className="text-[10px] sm:text-xs capitalize">{day.weather[0].description}</p>
                  <p className="text-[10px] sm:text-xs mt-1">
                    Min: {Math.round(day.main.temp_min)}°C | Max: {Math.round(day.main.temp_max)}°C
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

