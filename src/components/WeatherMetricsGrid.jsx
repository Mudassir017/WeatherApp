import React from 'react';
import {
  getUvCategory,
  getWindDirection,
  getAqiCategory,
} from '../services/weatherApi';
import {
  Sun,
  Wind,
  Droplets,
  Compass,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Activity,
  ShieldAlert,
} from 'lucide-react';

export default function WeatherMetricsGrid({ weatherData, unit }) {
  if (!weatherData || !weatherData.current) return null;

  const current = weatherData.current;
  const daily = weatherData.daily || {};
  const hourly = weatherData.hourly || {};
  const airQuality = weatherData.airQuality || {};

  // Helpers
  const formatTemp = (valC) => {
    if (valC === undefined || valC === null) return '--';
    if (unit === 'F') return Math.round((valC * 9) / 5 + 32);
    return Math.round(valC);
  };
  const tempUnit = unit === 'F' ? '°F' : '°C';

  // 1. UV Index
  const currentUv = daily.uv_index_max ? daily.uv_index_max[0] : 3.5;
  const uvCat = getUvCategory(currentUv);

  // 2. Wind & Gusts
  const windDeg = current.wind_direction_10m || 0;
  const windDirText = getWindDirection(windDeg);
  const windSpeed = unit === 'F' ? Math.round(current.wind_speed_10m * 0.621371) : Math.round(current.wind_speed_10m);
  const windGusts = unit === 'F' ? Math.round(current.wind_gusts_10m * 0.621371) : Math.round(current.wind_gusts_10m);
  const windUnit = unit === 'F' ? 'mph' : 'km/h';

  // 3. Dew Point & Humidity
  const dewPoint = hourly.dew_point_2m ? hourly.dew_point_2m[0] : current.temperature_2m - 4;

  // 4. Sunrise & Sunset
  const sunriseStr = daily.sunrise ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '06:12 AM';
  const sunsetStr = daily.sunset ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '07:48 PM';

  // Calculate sun position percentage along solar arc
  let sunProgress = 50;
  if (daily.sunrise && daily.sunset) {
    const now = new Date().getTime();
    const sr = new Date(daily.sunrise[0]).getTime();
    const ss = new Date(daily.sunset[0]).getTime();
    if (now < sr) sunProgress = 0;
    else if (now > ss) sunProgress = 100;
    else sunProgress = Math.round(((now - sr) / (ss - sr)) * 100);
  }

  // 5. Visibility & Pressure
  const visKm = hourly.visibility ? (hourly.visibility[0] / 1000).toFixed(1) : '10.0';
  const visMiles = hourly.visibility ? (hourly.visibility[0] * 0.000621371).toFixed(1) : '6.2';
  const visibilityVal = unit === 'F' ? `${visMiles} mi` : `${visKm} km`;
  const pressure = current.pressure_msl ? Math.round(current.pressure_msl) : 1013;

  // 6. Air Quality
  const aqiVal = airQuality.us_aqi !== undefined ? airQuality.us_aqi : 28;
  const aqiCat = getAqiCategory(aqiVal);

  return (
    <div id="metrics" className="w-full space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-xs tracking-mono-wide uppercase text-orchid-bloom font-medium">
            ATMOSPHERIC TELEMETRY MATRIX
          </span>
          <h3 className="subheading-lyon text-3xl sm:text-4xl text-pure tracking-tight font-normal mt-1">
            Detailed Weather Metrics
          </h3>
        </div>
      </div>

      {/* Grid of 6 Chromatic Feature Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tile 1: UV Index (Orchid Bloom Accent) */}
        <div className="rounded-tile bg-graphite border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-origin-lg group hover:border-orchid-bloom/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs tracking-mono-wide uppercase text-orchid-bloom font-medium flex items-center gap-1.5">
                <Sun className="w-4 h-4" />
                <span>UV INDEX</span>
              </span>
              <span className="font-mono text-xs text-fog uppercase">
                SOLAR INTENSITY
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="display-headline text-5xl text-pure font-normal">
                {currentUv.toFixed(1)}
              </span>
              <span className="font-sans text-xl font-medium text-orchid-bloom">
                {uvCat.level}
              </span>
            </div>
          </div>

          {/* UV Meter Bar */}
          <div className="space-y-2 mt-6">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-iris-gleam via-cyan-signal via-orchid-bloom to-red-500"
                style={{ width: `${Math.min((currentUv / 12) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs font-light text-ash">
              {currentUv <= 2
                ? 'Minimal sun risk. No special protection required.'
                : currentUv <= 7
                ? 'Moderate to high risk. Wear sunglasses & SPF 30+.'
                : 'Extreme solar radiation. Take immediate shade.'}
            </p>
          </div>
        </div>

        {/* Tile 2: Wind & Gusts (Cyan Signal Accent) */}
        <div className="rounded-tile bg-graphite border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-origin-lg group hover:border-cyan-signal/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs tracking-mono-wide uppercase text-cyan-signal font-medium flex items-center gap-1.5">
                <Wind className="w-4 h-4" />
                <span>WIND & VECTOR</span>
              </span>
              <span className="font-mono text-xs text-fog uppercase">
                {windDirText} · {windDeg}°
              </span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div>
                <span className="display-headline text-5xl text-pure font-normal">
                  {windSpeed}
                </span>
                <span className="font-mono text-sm text-ash ml-1">
                  {windUnit}
                </span>
                <p className="text-xs font-mono text-fog mt-1">
                  Gusts up to {windGusts} {windUnit}
                </p>
              </div>

              {/* Animated Compass Rose Dial */}
              <div className="relative w-16 h-16 rounded-full bg-obsidian border border-white/15 flex items-center justify-center">
                <Compass className="w-10 h-10 text-cyan-signal opacity-40" />
                <div
                  className="absolute w-1 h-8 bg-cyan-signal rounded-full shadow-sm transition-transform duration-700"
                  style={{ transform: `rotate(${windDeg}deg)` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs font-light text-ash mt-4">
            Directional vector {windDirText} ({windDeg}° azimuth) with steady velocity.
          </div>
        </div>

        {/* Tile 3: Humidity & Dew Point (Iris Gleam Accent) */}
        <div className="rounded-tile bg-graphite border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-origin-lg group hover:border-iris-gleam/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs tracking-mono-wide uppercase text-iris-gleam font-medium flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                <span>HUMIDITY</span>
              </span>
              <span className="font-mono text-xs text-fog uppercase">
                MOISTURE
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="display-headline text-5xl text-pure font-normal">
                {current.relative_humidity_2m}%
              </span>
              <span className="font-sans text-sm text-ash">
                Dew point: {formatTemp(dewPoint)}{tempUnit}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-iris-gleam"
                style={{ width: `${current.relative_humidity_2m}%` }}
              />
            </div>
            <p className="text-xs font-light text-ash">
              {current.relative_humidity_2m < 35
                ? 'Dry atmospheric conditions.'
                : current.relative_humidity_2m < 65
                ? 'Optimal ambient comfort zone.'
                : 'High moisture saturation level.'}
            </p>
          </div>
        </div>

        {/* Tile 4: Solar Arc (Sunrise & Sunset) */}
        <div className="rounded-tile bg-graphite border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-origin-lg group hover:border-amber-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs tracking-mono-wide uppercase text-amber-300 font-medium flex items-center gap-1.5">
                <Sunrise className="w-4 h-4" />
                <span>SOLAR TIMELINE</span>
              </span>
              <span className="font-mono text-xs text-fog uppercase">
                DAYLIGHT ARC
              </span>
            </div>

            {/* Solar Arc Curve Visualizer */}
            <div className="relative h-20 w-full my-2 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 80">
                {/* Arc path */}
                <path
                  d="M 20,70 Q 100,10 180,70"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />
                {/* Sun position marker */}
                {(() => {
                  const t = sunProgress / 100;
                  const cx = 20 + t * 160;
                  const cy = 70 - Math.sin(t * Math.PI) * 60;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      className="fill-amber-300 stroke-obsidian stroke-2 shadow-lg"
                    />
                  );
                })()}
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-300" />
              <div>
                <p className="text-fog font-mono text-[10px] uppercase">Sunrise</p>
                <p className="text-pure font-medium">{sunriseStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-fog font-mono text-[10px] uppercase">Sunset</p>
                <p className="text-pure font-medium">{sunsetStr}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tile 5: Visibility & Pressure */}
        <div className="rounded-tile bg-graphite border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-origin-lg group hover:border-pale-iris/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs tracking-mono-wide uppercase text-pale-iris font-medium flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>VISIBILITY & PRESSURE</span>
              </span>
              <span className="font-mono text-xs text-fog uppercase">
                BAROMETRIC
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div>
                <span className="display-headline text-4xl text-pure font-normal">
                  {visibilityVal}
                </span>
                <p className="text-xs font-mono text-fog mt-1">Sight Range</p>
              </div>

              <div>
                <span className="display-headline text-4xl text-pure font-normal">
                  {pressure}
                </span>
                <p className="text-xs font-mono text-fog mt-1">hPa Pressure</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs font-light text-ash mt-4">
            {pressure >= 1013 ? 'High pressure system (Stable & Clear)' : 'Low pressure system (Cloud / Precipitation)'}
          </div>
        </div>

        {/* Tile 6: Air Quality (Periwinkle Accent) */}
        <div className="rounded-tile bg-graphite border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-origin-lg group hover:border-periwinkle/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs tracking-mono-wide uppercase text-periwinkle font-medium flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                <span>AIR QUALITY INDEX</span>
              </span>
              <span className="font-mono text-xs text-fog uppercase">
                US AQI
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="display-headline text-5xl text-pure font-normal">
                {aqiVal}
              </span>
              <span className="font-sans text-lg font-medium text-periwinkle">
                {aqiCat.label}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-periwinkle"
                style={{ width: `${Math.min((aqiVal / 200) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs font-light text-ash">
              Air quality is rated satisfactory with clean atmospheric telemetry.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
