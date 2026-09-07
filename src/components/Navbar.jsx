import React, { useState } from 'react';
import { Cloud, MapPin, Search, ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar({ activeUnit, onToggleUnit, onUseLocation, onSearchClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 sticky-glass-nav w-full px-4 sm:px-8 py-3.5 sm:py-4 transition-all duration-300">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        
        {/* Brand Logo / Name */}
        <a href="#hero" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-btn bg-iris-gleam flex items-center justify-center text-obsidian shadow-sm group-hover:scale-105 transition-transform">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="subheading-lyon text-lg sm:text-xl tracking-tight text-pure font-normal">
                ORIGIN <span className="italic text-ash">Weather</span>
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] tracking-mono-wide text-ash uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/10 hidden xs:inline">
                v2.4 TELEMETRY
              </span>
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <a
            href="#hero"
            className="px-3.5 py-2 text-sm text-ash hover:text-pure transition-colors font-medium rounded-btn hover:bg-white/5"
          >
            Home
          </a>
          <a
            href="#dashboard"
            className="px-3.5 py-2 text-sm text-ash hover:text-pure transition-colors font-medium rounded-btn hover:bg-white/5"
          >
            Weather
          </a>
          <a
            href="#radar"
            className="px-3.5 py-2 text-sm text-ash hover:text-pure transition-colors font-medium rounded-btn hover:bg-white/5"
          >
            Radar
          </a>
          <a
            href="#metrics"
            className="px-3.5 py-2 text-sm text-ash hover:text-pure transition-colors font-medium rounded-btn hover:bg-white/5"
          >
            Metrics
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Temperature Unit Switcher */}
          <button
            onClick={onToggleUnit}
            className="nav-glass-btn text-xs font-mono tracking-wider text-cloud flex items-center gap-1 px-2.5 sm:px-3 py-1.5"
            title="Toggle Temperature Unit"
          >
            <span className={activeUnit === 'C' ? 'text-iris-gleam font-semibold' : 'text-fog'}>°C</span>
            <span className="text-fog">/</span>
            <span className={activeUnit === 'F' ? 'text-iris-gleam font-semibold' : 'text-fog'}>°F</span>
          </button>

          {/* Location Trigger */}
          <button
            onClick={onUseLocation}
            className="nav-glass-btn text-xs font-sans text-cloud hidden sm:flex items-center gap-1.5 px-3 py-1.5"
            title="Use Current Geolocation"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-signal" />
            <span>Locate</span>
          </button>

          {/* Primary CTA Action Button */}
          <a
            href="#dashboard"
            className="btn-primary-action text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ash hover:text-pure focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-white/10 mt-3 space-y-2 animate-atmospheric">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm text-ash hover:text-pure hover:bg-white/5 rounded-btn"
          >
            Home
          </a>
          <a
            href="#dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm text-ash hover:text-pure hover:bg-white/5 rounded-btn"
          >
            Weather Dashboard
          </a>
          <a
            href="#radar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm text-ash hover:text-pure hover:bg-white/5 rounded-btn"
          >
            Live Doppler Radar
          </a>
          <a
            href="#metrics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm text-ash hover:text-pure hover:bg-white/5 rounded-btn"
          >
            Atmospheric Metrics
          </a>
          
          <div className="pt-2 flex items-center justify-between px-4 border-t border-white/5">
            <button
              onClick={() => {
                onUseLocation();
                setMobileMenuOpen(false);
              }}
              className="btn-ghost-outline w-full text-xs flex items-center justify-center gap-2 py-2"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-signal" />
              <span>Use Current Geolocation</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
