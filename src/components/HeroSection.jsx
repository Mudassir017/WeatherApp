import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ArrowRight, Compass, Sparkles, Loader2, Navigation } from 'lucide-react';
import { searchLocations } from '../services/weatherApi';

export default function HeroSection({
  onSelectLocation,
  onUseLocation,
  isGeoLoading,
  locationError,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced live geocoding search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchLocations(query);
      setSuggestions(results);
      setIsSearching(false);
      setShowDropdown(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Hide dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc) => {
    setQuery(`${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}, ${loc.country}`);
    setShowDropdown(false);
    onSelectLocation({
      name: loc.name,
      admin1: loc.admin1 || '',
      country: loc.country || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  const quickCities = [
    { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
    { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
    { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426 },
    { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  ];

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      
      {/* Background Video Player */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
        >
          <source src="/weather_loop_compatible_h264.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Sky Atmosphere Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/85 via-obsidian/75 to-obsidian z-10" />
        
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f1011_80%)] z-10 pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-[900px] w-full text-center flex flex-col items-center gap-8 animate-atmospheric">
        
        {/* Eyebrow Pill Chip Badge */}
        <div className="pill-chip-label inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-signal animate-pulse" />
          <span>LIVE ATMOSPHERIC TELEMETRY · GLOBAL METEO GRID</span>
        </div>

        {/* Display Headline: Lyon Display style serif with italic emphasis */}
        <h1 className="display-headline text-5xl sm:text-7xl md:text-8xl tracking-tight text-pure font-normal max-w-[850px] leading-[0.9]">
          The Ultimate <span className="italic font-normal text-cloud">Weather</span> App
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl font-light text-ash max-w-[600px] leading-relaxed">
          Real-time weather, forecasts, and radar for anywhere in the world.
        </p>

        {/* AI Prompt Style Search Field & Dropdown */}
        <div className="w-full max-w-[680px] relative mt-2" ref={dropdownRef}>
          <form onSubmit={handleSubmit} className="relative">
            <div className="ai-prompt-input-wrapper flex items-center gap-3">
              <Search className="w-5 h-5 text-ash flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder="Where am I inspecting weather today? (e.g. Tokyo, Paris, New York)..."
                className="w-full bg-transparent text-pure placeholder:text-fog font-sans text-sm sm:text-base outline-none pr-2 py-1.5"
              />
              
              {isSearching ? (
                <div className="p-2">
                  <Loader2 className="w-5 h-5 text-iris-gleam animate-spin" />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-pure flex items-center justify-center flex-shrink-0 transition-colors"
                  title="Search location"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Location Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-graphite border border-white/10 rounded-2xl shadow-origin-lg backdrop-blur-2xl overflow-hidden z-50 text-left">
              <div className="px-4 py-2 bg-abyss/60 border-b border-white/5 font-mono text-[10px] uppercase tracking-mono-wide text-fog">
                Matches Found ({suggestions.length})
              </div>
              <ul className="max-h-[280px] overflow-y-auto divide-y divide-white/5">
                {suggestions.map((loc, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSelect(loc)}
                      className="w-full px-5 py-3.5 hover:bg-steel/60 flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-iris-gleam group-hover:text-cyan-signal transition-colors" />
                        <div>
                          <p className="text-sm font-medium text-pure">
                            {loc.name}
                          </p>
                          <p className="text-xs text-ash">
                            {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-fog group-hover:text-pure transition-colors">
                        {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons & Geolocation Trigger */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-1">
          
          <button
            onClick={onUseLocation}
            disabled={isGeoLoading}
            className="btn-ghost-outline flex items-center gap-2"
          >
            {isGeoLoading ? (
              <Loader2 className="w-4 h-4 text-cyan-signal animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-cyan-signal" />
            )}
            <span>Use My Location</span>
          </button>

          <a href="#radar" className="nav-glass-btn text-sm font-medium text-cloud flex items-center gap-2">
            <Compass className="w-4 h-4 text-iris-gleam" />
            <span>Launch Live Radar</span>
          </a>
        </div>

        {/* Geolocation Error Alert if any */}
        {locationError && (
          <div className="px-4 py-2 rounded-btn bg-red-950/60 border border-red-500/30 text-red-200 text-xs font-sans mt-2">
            {locationError}
          </div>
        )}

        {/* Quick Cities Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-[650px]">
          <span className="font-mono text-[11px] text-fog uppercase tracking-wider mr-1">Quick Select:</span>
          {quickCities.map((city) => (
            <button
              key={city.name}
              onClick={() => onSelectLocation(city)}
              className="px-3 py-1 rounded-pill bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-ash hover:text-pure transition-all duration-200"
            >
              {city.name}
            </button>
          ))}
        </div>

      </div>

      {/* Decorative Bottom Divider Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent pointer-events-none z-20" />
    </section>
  );
}
