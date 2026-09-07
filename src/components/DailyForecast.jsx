import React from 'react';
import { getWeatherCondition } from '../services/weatherApi';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudDrizzle,
  CloudFog,
  Umbrella,
  Calendar,
} from 'lucide-react';

export default function DailyForecast({ weatherData, unit }) {
  if (!weatherData || !weatherData.daily) return null;

  const daily = weatherData.daily;
  const times = daily.time || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const codes = daily.weather_code || [];
  const precips = daily.precipitation_probability_max || [];

  const formatTemp = (valC) => {
    if (valC === undefined || valC === null) return '--';
    if (unit === 'F') return Math.round((valC * 9) / 5 + 32);
    return Math.round(valC);
  };

  const allMin = Math.min(...minTemps.map((t) => formatTemp(t)));
  const allMax = Math.max(...maxTemps.map((t) => formatTemp(t)));
  const globalSpan = allMax - allMin === 0 ? 1 : allMax - allMin;

  const renderIcon = (iconName) => {
    const props = { className: "w-5 h-5 flex-shrink-0" };
    switch (iconName) {
      case 'Sun': return <Sun className="w-5 h-5 text-amber-300 flex-shrink-0" />;
      case 'CloudSun': return <CloudSun className="w-5 h-5 text-amber-200 flex-shrink-0" />;
      case 'CloudRain': return <CloudRain className="w-5 h-5 text-cyan-signal flex-shrink-0" />;
      case 'CloudLightning': return <CloudLightning className="w-5 h-5 text-orchid-bloom flex-shrink-0" />;
      case 'Snowflake': return <Snowflake className="w-5 h-5 text-pale-iris flex-shrink-0" />;
      case 'CloudDrizzle': return <CloudDrizzle className="w-5 h-5 text-cyan-signal flex-shrink-0" />;
      case 'CloudFog': return <CloudFog className="w-5 h-5 text-ash flex-shrink-0" />;
      default: return <Cloud className="w-5 h-5 text-ash flex-shrink-0" />;
    }
  };

  const getDayLabel = (dateStr, idx) => {
    if (idx === 0) return 'Today';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="w-full rounded-tile bg-deep-iris/30 border border-white/10 p-5 sm:p-8 text-pure shadow-origin-lg backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <span className="font-mono text-[10px] sm:text-xs tracking-mono-wide uppercase text-pale-iris font-medium">
            EXTENDED 7-DAY OUTLOOK
          </span>
          <h3 className="subheading-lyon text-2xl sm:text-3xl text-pure tracking-tight font-normal mt-0.5">
            Multi-Day Forecast
          </h3>
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-ash">
          <Calendar className="w-4 h-4 text-pale-iris hidden xs:inline" />
          <span>7-DAY OUTLOOK</span>
        </div>
      </div>

      {/* Daily Rows List */}
      <div className="flex flex-col divide-y divide-white/10">
        {times.slice(0, 7).map((dateStr, idx) => {
          const maxT = formatTemp(maxTemps[idx]);
          const minT = formatTemp(minTemps[idx]);
          const cond = getWeatherCondition(codes[idx]);
          const precip = precips[idx] || 0;

          const leftPct = ((minT - allMin) / globalSpan) * 100;
          const widthPct = Math.max(((maxT - minT) / globalSpan) * 100, 8);

          return (
            <div
              key={dateStr}
              className="py-3.5 sm:py-4 grid grid-cols-12 items-center gap-2 sm:gap-4 hover:bg-white/5 px-2 sm:px-3 rounded-2xl transition-colors"
            >
              {/* Day Name */}
              <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                <span className="font-sans text-sm sm:text-base font-semibold text-pure truncate">
                  {getDayLabel(dateStr, idx)}
                </span>
                {idx === 0 && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-iris-gleam px-1.5 py-0.5 rounded bg-iris-gleam/20 border border-iris-gleam/30 hidden xs:inline">
                    NOW
                  </span>
                )}
              </div>

              {/* Condition Icon & Label */}
              <div className="col-span-5 sm:col-span-4 flex items-center gap-2 truncate">
                {renderIcon(cond.icon)}
                <span className="text-xs sm:text-sm font-light text-cloud truncate">
                  {cond.label}
                </span>
              </div>

              {/* Rain Chance */}
              <div className="col-span-3 sm:col-span-1 text-right sm:text-left flex items-center justify-end sm:justify-start gap-1 font-mono text-[11px] text-cyan-signal">
                <Umbrella className="w-3.5 h-3.5 hidden xs:inline" />
                <span>{precip}%</span>
              </div>

              {/* Temperature Visual Range Bar */}
              <div className="col-span-12 sm:col-span-4 flex items-center gap-2.5 mt-1 sm:mt-0">
                <span className="font-mono text-xs text-fog w-7 text-right font-medium">
                  {minT}°
                </span>

                <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-signal via-iris-gleam to-orchid-bloom"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  />
                </div>

                <span className="font-mono text-xs text-pure w-7 font-medium">
                  {maxT}°
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
