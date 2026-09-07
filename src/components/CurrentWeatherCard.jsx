import React from 'react';
import { getWeatherCondition, getWindDirection } from '../services/weatherApi';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  MapPin,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

export default function CurrentWeatherCard({
  location,
  weatherData,
  unit,
  onSaveFavorite,
  isFavorite,
}) {
  if (!weatherData || !weatherData.current) return null;

  const current = weatherData.current;
  const daily = weatherData.daily || {};
  const cond = getWeatherCondition(current.weather_code);

  // Temperature unit conversion helpers
  const formatTemp = (valC) => {
    if (valC === undefined || valC === null) return '--';
    if (unit === 'F') {
      return Math.round((valC * 9) / 5 + 32);
    }
    return Math.round(valC);
  };

  const tempUnit = unit === 'F' ? '°F' : '°C';
  const windUnit = unit === 'F' ? 'mph' : 'km/h';
  const windSpeed = unit === 'F' ? Math.round(current.wind_speed_10m * 0.621371) : Math.round(current.wind_speed_10m);

  const maxTemp = daily.temperature_2m_max ? daily.temperature_2m_max[0] : null;
  const minTemp = daily.temperature_2m_min ? daily.temperature_2m_min[0] : null;

  // Icon mapping helper
  const renderIcon = (iconName) => {
    const props = { className: "w-12 h-12 text-pure drop-shadow-md" };
    switch (iconName) {
      case 'Sun': return <Sun {...props} />;
      case 'CloudSun': return <CloudSun {...props} />;
      case 'CloudRain': return <CloudRain {...props} />;
      case 'CloudLightning': return <CloudLightning {...props} />;
      case 'Snowflake': return <Snowflake {...props} />;
      case 'CloudDrizzle': return <CloudDrizzle {...props} />;
      case 'CloudFog': return <CloudFog {...props} />;
      default: return <Cloud {...props} />;
    }
  };

  return (
    <div className="relative w-full rounded-tile bg-iris-gleam p-6 sm:p-8 lg:p-10 text-pure shadow-origin-lg overflow-hidden transition-all duration-300">
      
      {/* Background Decorative Pattern / Ambient Wash */}
      <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/2 top-0 w-96 h-96 rounded-full bg-deep-iris/30 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs tracking-mono-wide uppercase text-white/80 font-medium">
              CURRENT ATMOSPHERE · {location.country || 'TELEMETRY'}
            </span>
          </div>
          <h2 className="subheading-lyon text-3xl sm:text-4xl lg:text-5xl text-pure tracking-tight font-normal">
            {location.name}
          </h2>
          {location.admin1 && (
            <p className="text-sm text-white/80 font-light mt-0.5">
              {location.admin1}, {location.country}
            </p>
          )}
        </div>

        {/* Favorite Location Bookmark Button */}
        <button
          onClick={() => onSaveFavorite(location)}
          className="p-3 rounded-full bg-white/15 hover:bg-white/25 transition-all text-pure border border-white/20 shadow-sm flex items-center justify-center"
          title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
        >
          {isFavorite ? (
            <BookmarkCheck className="w-5 h-5 fill-pure" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Temperature & Weather Condition Display */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
        
        {/* Main Temperature Number */}
        <div className="md:col-span-7 flex items-baseline gap-4">
          <span className="display-headline text-7xl sm:text-8xl md:text-9xl tracking-tight text-pure font-normal leading-none">
            {formatTemp(current.temperature_2m)}{tempUnit}
          </span>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {renderIcon(cond.icon)}
              <span className="text-xl sm:text-2xl font-light text-pure">
                {cond.label}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs sm:text-sm font-sans text-white/80 mt-1">
              <span>Feels like {formatTemp(current.apparent_temperature)}{tempUnit}</span>
              {maxTemp !== null && minTemp !== null && (
                <>
                  <span>•</span>
                  <span>H: {formatTemp(maxTemp)}{tempUnit} L: {formatTemp(minTemp)}{tempUnit}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Highlight Quick Stats Box */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3 bg-obsidian/30 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5">
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/70 font-mono text-[11px] uppercase tracking-wider">
              <Wind className="w-3.5 h-3.5 text-cyan-signal" />
              <span>Wind</span>
            </div>
            <span className="text-lg font-medium text-pure">
              {windSpeed} {windUnit}
            </span>
            <span className="text-xs text-white/70">
              Direction: {getWindDirection(current.wind_direction_10m)}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/70 font-mono text-[11px] uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 text-pale-iris" />
              <span>Humidity</span>
            </div>
            <span className="text-lg font-medium text-pure">
              {current.relative_humidity_2m}%
            </span>
            <span className="text-xs text-white/70">
              Cloud: {current.cloud_cover}%
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Micro Telemetry Bar */}
      <div className="relative z-10 pt-4 mt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-white/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>STATION STATUS: ACTIVE TELEMETRY</span>
        </div>
        <div>
          LAT: {location.latitude?.toFixed(3)}° · LON: {location.longitude?.toFixed(3)}°
        </div>
      </div>

    </div>
  );
}
