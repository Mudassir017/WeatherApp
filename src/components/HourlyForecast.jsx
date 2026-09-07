import React, { useMemo } from 'react';
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
} from 'lucide-react';

export default function HourlyForecast({ weatherData, unit }) {
  if (!weatherData || !weatherData.hourly) return null;

  const hourly = weatherData.hourly;
  const times = hourly.time || [];
  const temps = hourly.temperature_2m || [];
  const codes = hourly.weather_code || [];
  const precips = hourly.precipitation_probability || [];

  // Filter next 24 hours starting from current hour
  const nowIndex = useMemo(() => {
    const nowIso = new Date().toISOString().substring(0, 13);
    const idx = times.findIndex((t) => t.startsWith(nowIso));
    return idx >= 0 ? idx : 0;
  }, [times]);

  const next24Hours = useMemo(() => {
    return times.slice(nowIndex, nowIndex + 24).map((t, idx) => {
      const globalIdx = nowIndex + idx;
      const dateObj = new Date(t);
      const hourStr = dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      return {
        timeStr: idx === 0 ? 'Now' : hourStr,
        rawTemp: temps[globalIdx],
        code: codes[globalIdx],
        precip: precips[globalIdx] || 0,
      };
    });
  }, [times, temps, codes, precips, nowIndex]);

  const formatTemp = (valC) => {
    if (valC === undefined || valC === null) return '--';
    if (unit === 'F') return Math.round((valC * 9) / 5 + 32);
    return Math.round(valC);
  };

  const tempUnit = unit === 'F' ? '°F' : '°C';

  // SVG Sparkline calculation
  const sparklineData = useMemo(() => {
    if (next24Hours.length === 0) return { path: '', points: [] };
    const displayTemps = next24Hours.map((h) => formatTemp(h.rawTemp));
    const min = Math.min(...displayTemps);
    const max = Math.max(...displayTemps);
    const range = max - min === 0 ? 1 : max - min;
    
    const width = 24 * 76; // 76px per card
    const height = 40;

    const points = displayTemps.map((val, i) => {
      const x = i * 76 + 38; // center of each card
      const y = height - ((val - min) / range) * (height - 12) - 6;
      return { x, y, val };
    });

    const path = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    return { path, points, width, height };
  }, [next24Hours, unit]);

  const renderIcon = (iconName) => {
    const props = { className: "w-6 h-6 text-pure" };
    switch (iconName) {
      case 'Sun': return <Sun className="w-6 h-6 text-amber-300" />;
      case 'CloudSun': return <CloudSun className="w-6 h-6 text-amber-200" />;
      case 'CloudRain': return <CloudRain className="w-6 h-6 text-cyan-signal" />;
      case 'CloudLightning': return <CloudLightning className="w-6 h-6 text-orchid-bloom" />;
      case 'Snowflake': return <Snowflake className="w-6 h-6 text-pale-iris" />;
      case 'CloudDrizzle': return <CloudDrizzle className="w-6 h-6 text-cyan-signal" />;
      case 'CloudFog': return <CloudFog className="w-6 h-6 text-ash" />;
      default: return <Cloud className="w-6 h-6 text-ash" />;
    }
  };

  return (
    <div className="w-full rounded-tile bg-graphite p-6 sm:p-8 border border-white/10 text-pure shadow-origin-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-xs tracking-mono-wide uppercase text-cyan-signal font-medium">
            24-HOUR CONTINUOUS TIMELINE
          </span>
          <h3 className="subheading-lyon text-2xl sm:text-3xl text-pure tracking-tight font-normal mt-1">
            Hourly Forecast
          </h3>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-fog">
          <span className="w-2 h-2 rounded-full bg-cyan-signal" />
          <span>CYAN SIGNAL SPARKLINE</span>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative overflow-x-auto custom-scrollbar pb-4 pt-2">
        <div className="relative min-w-max flex items-start gap-0">
          
          {/* SVG Sparkline Overlay */}
          <div className="absolute top-24 left-0 pointer-events-none z-10">
            <svg
              width={sparklineData.width}
              height={sparklineData.height}
              className="overflow-visible"
            >
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00b3dd" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#847dff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#00b3dd" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path
                d={sparklineData.path}
                fill="none"
                stroke="url(#sparklineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {sparklineData.points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-obsidian stroke-cyan-signal stroke-2"
                />
              ))}
            </svg>
          </div>

          {/* Cards for each hour */}
          {next24Hours.map((h, idx) => {
            const cond = getWeatherCondition(h.code);
            return (
              <div
                key={idx}
                className={`w-[76px] flex-shrink-0 flex flex-col items-center gap-2 py-3 px-1 rounded-2xl transition-colors ${
                  idx === 0
                    ? 'bg-steel/60 border border-white/20'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Hour Label */}
                <span className="font-mono text-xs tracking-wider text-ash font-medium">
                  {h.timeStr}
                </span>

                {/* Weather Icon */}
                <div className="my-1 flex items-center justify-center h-8">
                  {renderIcon(cond.icon)}
                </div>

                {/* Temperature */}
                <span className="text-base font-semibold text-pure mt-8">
                  {formatTemp(h.rawTemp)}{tempUnit}
                </span>

                {/* Precipitation Chance */}
                <div className="flex items-center gap-0.5 text-[10px] font-mono text-cyan-signal mt-1">
                  <Umbrella className="w-3 h-3" />
                  <span>{h.precip}%</span>
                </div>
              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
}
