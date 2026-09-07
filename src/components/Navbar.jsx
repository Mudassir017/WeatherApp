import React from 'react';
import { Cloud, MapPin, Search, ArrowRight, Compass } from 'lucide-react';

export default function Navbar({ activeUnit, onToggleUnit, onUseLocation, onSearchClick }) {
  return (
    <header className="sticky top-0 z-50 sticky-glass-nav w-full px-4 sm:px-8 py-4 transition-all duration-300">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        
        {/* Brand Logo / Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-btn bg-iris-gleam flex items-center justify-center text-obsidian shadow-sm">
            <Cloud className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="subheading-lyon text-xl tracking-tight text-pure font-normal">
                ORIGIN <span className="italic text-ash">Weather</span>
              </span>
              <span className="font-mono text-[10px] tracking-mono-wide text-ash uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                v2.4 TELEMETRY
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-2">
          <a
            href="#hero"
            className="px-4 py-2 text-sm text-ash hover:text-pure transition-colors font-medium"
          >
            Home
          </a>
          <a
            href="#dashboard"
            className="px-4 py-2 text-sm text-ash hover:text-pure transition-colors font-medium"
          >
            Weather
          </a>
          <a
            href="#radar"
            className="px-4 py-2 text-sm text-ash hover:text-pure transition-colors font-medium"
          >
            Radar
          </a>
          <a
            href="#metrics"
            className="px-4 py-2 text-sm text-ash hover:text-pure transition-colors font-medium"
          >
            Metrics
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Temperature Unit Switcher */}
          <button
            onClick={onToggleUnit}
            className="nav-glass-btn text-xs font-mono tracking-wider text-cloud flex items-center gap-1"
            title="Toggle Temperature Unit"
          >
            <span className={activeUnit === 'C' ? 'text-iris-gleam font-semibold' : 'text-fog'}>°C</span>
            <span className="text-fog">/</span>
            <span className={activeUnit === 'F' ? 'text-iris-gleam font-semibold' : 'text-fog'}>°F</span>
          </button>

          {/* Quick Location Button */}
          <button
            onClick={onUseLocation}
            className="nav-glass-btn text-xs font-sans text-cloud hidden sm:flex items-center gap-1.5"
            title="Use Current Geolocation"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-signal" />
            <span>Locate</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onSearchClick}
            className="nav-glass-btn p-2 text-cloud sm:hidden"
            title="Search Location"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Primary CTA Button */}
          <a
            href="#dashboard"
            className="btn-primary-action text-xs sm:text-sm"
          >
            <span>Explore App</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </header>
  );
}
