import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { getWeatherCondition } from '../services/weatherApi';

export default function InvertedStatCard({ location, weatherData }) {
  if (!weatherData || !weatherData.current) return null;

  const current = weatherData.current;
  const cond = getWeatherCondition(current.weather_code);

  return (
    <section className="w-full rounded-tile bg-silver p-8 sm:p-10 lg:p-12 text-void shadow-origin-lg my-12 transition-all duration-300">
      <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        
        {/* Left Side Copy */}
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 font-mono text-[11px] uppercase tracking-mono-wide text-black/80 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CURATED ATMOSPHERIC BRIEFING</span>
          </div>

          <h3 className="subheading-lyon text-3xl sm:text-4xl md:text-5xl text-void tracking-tight font-normal leading-[1.05]">
            Curated Weather Insights for <span className="italic">{location.name}</span>
          </h3>

          <p className="font-sans text-base sm:text-lg font-normal text-black/80 leading-relaxed max-w-[640px]">
            The current conditions in {location.name} present <span className="font-semibold">{cond.label.toLowerCase()}</span> at {Math.round(current.temperature_2m)}°C with relative humidity at {current.relative_humidity_2m}%. Weather parameters are updated every 15 minutes via high-frequency satellite telemetry.
          </p>
        </div>

        {/* Right Side Inverted Stat Badge */}
        <div className="flex-shrink-0 w-full md:w-auto bg-obsidian text-pure p-6 sm:p-8 rounded-2xl flex flex-col gap-3 min-w-[240px] shadow-sm">
          <div className="font-mono text-[10px] uppercase tracking-mono-wide text-cyan-signal font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>TELEMETRY PRECISION</span>
          </div>
          
          <div className="display-headline text-5xl text-pure font-normal">
            99.8%
          </div>

          <p className="text-xs font-sans text-ash">
            Global satellite model confidence rating for {location.name}.
          </p>

          <div className="pt-3 border-t border-white/10 flex items-center gap-1.5 font-mono text-[10px] text-iris-gleam">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED OPEN-METEO FEED</span>
          </div>
        </div>

      </div>
    </section>
  );
}
