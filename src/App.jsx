import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherMetricsGrid from './components/WeatherMetricsGrid';
import InvertedStatCard from './components/InvertedStatCard';
import RadarMap from './components/RadarMap';
import SavedLocations from './components/SavedLocations';

import {
  fetchWeatherData,
  reverseGeocode,
} from './services/weatherApi';
import { Loader2, RefreshCw, AlertCircle, Sparkles, Heart } from 'lucide-react';

const DEFAULT_LOCATION = {
  name: 'Tokyo',
  admin1: 'Tokyo Metropolis',
  country: 'Japan',
  latitude: 35.6762,
  longitude: 139.6503,
};

export default function App() {
  const [activeLocation, setActiveLocation] = useState(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [unit, setUnit] = useState('C'); // 'C' or 'F'

  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('origin_weather_favs');
      return saved ? JSON.parse(saved) : [DEFAULT_LOCATION];
    } catch {
      return [DEFAULT_LOCATION];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('origin_weather_favs', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites:', e);
    }
  }, [favorites]);

  // Fetch weather whenever activeLocation changes
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      setIsLoadingWeather(true);
      setWeatherError(null);
      try {
        const data = await fetchWeatherData(
          activeLocation.latitude,
          activeLocation.longitude
        );
        if (isMounted) {
          setWeatherData(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Weather fetch error:', err);
          setWeatherError('Unable to load weather telemetry. Please verify network connection.');
        }
      } finally {
        if (isMounted) setIsLoadingWeather(false);
      }
    }

    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [activeLocation]);

  // Browser Geolocation Handler
  const handleUseLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const locDetails = await reverseGeocode(latitude, longitude);
        setActiveLocation(locDetails);
        setIsGeoLoading(false);
      },
      (err) => {
        setIsGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. Please search for a city manually.');
        } else {
          setLocationError('Unable to detect current location coordinates.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleToggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  const handleSaveFavorite = (loc) => {
    const exists = favorites.some(
      (f) => Math.abs(f.latitude - loc.latitude) < 0.01 && Math.abs(f.longitude - loc.longitude) < 0.01
    );
    if (exists) {
      setFavorites((prev) =>
        prev.filter(
          (f) => !(Math.abs(f.latitude - loc.latitude) < 0.01 && Math.abs(f.longitude - loc.longitude) < 0.01)
        )
      );
    } else {
      setFavorites((prev) => [...prev, loc]);
    }
  };

  const handleRemoveFavorite = (loc) => {
    setFavorites((prev) =>
      prev.filter(
        (f) => !(Math.abs(f.latitude - loc.latitude) < 0.01 && Math.abs(f.longitude - loc.longitude) < 0.01)
      )
    );
  };

  const isFavorite = favorites.some(
    (f) => Math.abs(f.latitude - activeLocation.latitude) < 0.01 && Math.abs(f.longitude - activeLocation.longitude) < 0.01
  );

  return (
    <div className="min-h-screen bg-obsidian text-pure font-sans flex flex-col selection:bg-iris-gleam selection:text-obsidian">
      
      {/* Navigation Header */}
      <Navbar
        activeUnit={unit}
        onToggleUnit={handleToggleUnit}
        onUseLocation={handleUseLocation}
        onSearchClick={() => {
          document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Hero Section with Video Canvas */}
      <HeroSection
        onSelectLocation={(loc) => setActiveLocation(loc)}
        onUseLocation={handleUseLocation}
        isGeoLoading={isGeoLoading}
        locationError={locationError}
      />

      {/* Main Weather Telemetry Content Container */}
      <main id="dashboard" className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1">
        
        {/* Saved Favorites Quick Select Bar */}
        <SavedLocations
          favorites={favorites}
          onSelectLocation={(loc) => setActiveLocation(loc)}
          onRemoveFavorite={handleRemoveFavorite}
        />

        {/* Loading Spinner State */}
        {isLoadingWeather ? (
          <div className="w-full rounded-tile bg-graphite border border-white/10 p-16 flex flex-col items-center justify-center gap-4 text-center my-8">
            <Loader2 className="w-10 h-10 text-iris-gleam animate-spin" />
            <p className="font-mono text-sm tracking-mono-wide uppercase text-ash">
              CONNECTING TO SATELLITE TELEMETRY…
            </p>
          </div>
        ) : weatherError ? (
          /* Error State */
          <div className="w-full rounded-tile bg-red-950/40 border border-red-500/30 p-10 flex flex-col items-center justify-center gap-4 text-center my-8">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-base text-red-200">{weatherError}</p>
            <button
              onClick={() => setActiveLocation({ ...activeLocation })}
              className="btn-primary-action"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Telemetry Request</span>
            </button>
          </div>
        ) : (
          /* Weather Dashboard Content */
          <>
            {/* 1. Feature Category Tile: Current Weather */}
            <CurrentWeatherCard
              location={activeLocation}
              weatherData={weatherData}
              unit={unit}
              onSaveFavorite={handleSaveFavorite}
              isFavorite={isFavorite}
            />

            {/* 2. 24-Hour Continuous Timeline Forecast */}
            <HourlyForecast
              weatherData={weatherData}
              unit={unit}
            />

            {/* 3. 7-Day Multi-Day Outlook */}
            <DailyForecast
              weatherData={weatherData}
              unit={unit}
            />

            {/* 4. Atmospheric Detail Metrics Grid */}
            <WeatherMetricsGrid
              weatherData={weatherData}
              unit={unit}
            />

            {/* 5. Inverted Light Silver Surface Card */}
            <InvertedStatCard
              location={activeLocation}
              weatherData={weatherData}
            />

            {/* 6. Live Doppler Radar Section */}
            <RadarMap location={activeLocation} />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full bg-abyss border-t border-white/10 py-12 px-4 sm:px-8 mt-20 text-fog text-xs font-mono">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-iris-gleam flex items-center justify-center text-obsidian font-bold text-xs">
              O
            </div>
            <span className="text-ash font-sans text-sm font-medium">
              ORIGIN FINANCIAL WEATHER ARCHITECTURE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-ash">
            <span>DARK GALLERY SYSTEM</span>
            <span>OPEN-METEO ENGINE</span>
            <span>RAINVIEWER RADAR</span>
          </div>

          <div className="text-fog">
            © {new Date().getFullYear()} ORIGIN. ALL ATMOSPHERIC TELEMETRY RESERVED.
          </div>
        </div>
      </footer>

    </div>
  );
}
