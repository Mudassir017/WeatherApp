import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { Play, Pause, RotateCcw, MapPin, Radio, Sliders, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RadarMap({ location }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const radarLayerRef = useRef(null);

  const [radarFrames, setRadarFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [opacity, setOpacity] = useState(0.75);
  const [isLoadingRadar, setIsLoadingRadar] = useState(true);
  const [radarError, setRadarError] = useState(null);

  const lat = location?.latitude || 35.6762;
  const lon = location?.longitude || 139.6503;

  // Fetch RainViewer radar telemetry
  const loadRainViewerData = async () => {
    setIsLoadingRadar(true);
    setRadarError(null);
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error(`RainViewer API returned status ${res.status}`);
      const data = await res.json();
      
      const host = data.host || 'https://tilecache.rainviewer.com';
      const past = data.radar?.past || [];
      const nowcast = data.radar?.nowcast || [];
      const combined = [...past, ...nowcast];

      if (combined.length > 0) {
        const formattedFrames = combined.map((f) => ({
          time: f.time,
          path: f.path || `/v2/radar/${f.time}/256`,
          host: host,
        }));
        setRadarFrames(formattedFrames);
        setCurrentFrameIdx(formattedFrames.length - 1); // Start at most recent frame
      } else {
        setRadarError('No live radar frames available for current area.');
      }
    } catch (err) {
      console.warn('RainViewer API load error:', err);
      setRadarError('Unable to load RainViewer doppler radar tiles.');
    } finally {
      setIsLoadingRadar(false);
    }
  };

  useEffect(() => {
    loadRainViewerData();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lon],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    // Add CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom Location Marker Pin
    const customIcon = L.divIcon({
      className: 'custom-radar-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-cyan-signal/40 radar-live-dot absolute"></div>
          <div class="w-4 h-4 rounded-full bg-cyan-signal border-2 border-obsidian shadow-md"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(`<b style="color: #0f1011;">${location.name}</b><br/>Radar Monitoring Station`);

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    leafletMap.current = map;
    markerRef.current = marker;

    // Trigger map resize invalidation
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      if (leafletMap.current) leafletMap.current.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update map view when active location changes
  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.setView([lat, lon], 8, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.getPopup()?.setContent(`<b style="color: #0f1011;">${location.name}</b><br/>Radar Monitoring Station`);
      }
      setTimeout(() => {
        leafletMap.current?.invalidateSize();
      }, 100);
    }
  }, [lat, lon, location.name]);

  // Render RainViewer Radar Tiles
  useEffect(() => {
    if (!leafletMap.current || radarFrames.length === 0) return;

    const frame = radarFrames[currentFrameIdx];
    if (!frame) return;

    // Construct tile URL accurately according to RainViewer v2 standard
    const tileUrl = `${frame.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    if (radarLayerRef.current) {
      leafletMap.current.removeLayer(radarLayerRef.current);
    }

    const newRadarLayer = L.tileLayer(tileUrl, {
      opacity: opacity,
      tileSize: 256,
      maxZoom: 18,
      zIndex: 100,
    }).addTo(leafletMap.current);

    radarLayerRef.current = newRadarLayer;
  }, [currentFrameIdx, radarFrames, opacity]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % radarFrames.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, radarFrames.length]);

  // Timestamp string
  const currentTimestampStr = radarFrames[currentFrameIdx]
    ? new Date(radarFrames[currentFrameIdx].time * 1000).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Live';

  return (
    <section id="radar" className="w-full space-y-4 my-10 sm:my-14">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-xs tracking-mono-wide uppercase text-cyan-signal font-medium flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-signal animate-pulse" />
            <span>LIVE DOPPLER RADAR TELEMETRY</span>
          </span>
          <h3 className="subheading-lyon text-2xl sm:text-4xl text-pure tracking-tight font-normal mt-1">
            Interactive Precipitation Radar
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRainViewerData}
            disabled={isLoadingRadar}
            className="nav-glass-btn text-xs text-ash flex items-center gap-1.5"
            title="Reload Radar Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRadar ? 'animate-spin text-cyan-signal' : ''}`} />
            <span className="hidden xs:inline">Refresh Radar</span>
          </button>

          <div className="pill-chip-label inline-flex items-center gap-2 text-[10px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-signal animate-ping" />
            <span>RAINVIEWER METEO GRID</span>
          </div>
        </div>
      </div>

      {/* Radar Map Card Container */}
      <div className="relative w-full rounded-tile bg-graphite border border-white/10 overflow-hidden shadow-origin-lg h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col">
        
        {/* Leaflet Map Target Div */}
        <div ref={mapRef} className="w-full h-full z-0 dark-map" />

        {/* Top Location & Timestamp Bar */}
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          <div className="pointer-events-auto bg-obsidian/90 backdrop-blur-md border border-white/15 px-3 py-1.5 sm:px-4 sm:py-2 rounded-btn text-pure flex items-center gap-2 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-cyan-signal" />
            <span className="text-xs sm:text-sm font-semibold">{location.name}</span>
            <span className="font-mono text-[10px] sm:text-xs text-fog hidden sm:inline">
              ({lat.toFixed(2)}°, {lon.toFixed(2)}°)
            </span>
          </div>

          <div className="pointer-events-auto bg-obsidian/90 backdrop-blur-md border border-white/15 px-3 py-1.5 sm:px-4 sm:py-2 rounded-btn font-mono text-xs text-pure flex items-center gap-2 shadow-md">
            <span className="text-fog text-[10px] sm:text-xs">TIME:</span>
            <span className="text-cyan-signal font-semibold">{currentTimestampStr}</span>
          </div>

        </div>

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto z-10 pointer-events-auto bg-obsidian/95 backdrop-blur-xl border border-white/20 p-3 sm:p-4 rounded-2xl shadow-origin-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:max-w-[520px]">
          
          {/* Play/Pause & Step Buttons */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-btn bg-white/15 hover:bg-white/25 text-pure flex items-center justify-center transition-colors border border-white/10"
              title={isPlaying ? 'Pause Radar Loop' : 'Play Radar Loop'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-pure" />}
            </button>

            <div className="flex items-center gap-1 bg-white/5 rounded-btn border border-white/10 p-1">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrameIdx((prev) => (prev > 0 ? prev - 1 : radarFrames.length - 1));
                }}
                className="p-1 text-ash hover:text-pure transition-colors"
                title="Previous Frame"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[10px] sm:text-xs text-cloud px-1">
                {currentFrameIdx + 1}/{radarFrames.length || 1}
              </span>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrameIdx((prev) => (prev + 1) % radarFrames.length);
                }}
                className="p-1 text-ash hover:text-pure transition-colors"
                title="Next Frame"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="flex-1 min-w-[120px] space-y-1">
            <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-fog uppercase">
              <span>Past</span>
              <span className="text-cyan-signal">{currentTimestampStr}</span>
              <span>Forecast</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max((radarFrames.length || 1) - 1, 0)}
              value={currentFrameIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrameIdx(Number(e.target.value));
              }}
              className="w-full accent-cyan-signal bg-white/10 rounded-full h-1.5 cursor-pointer"
            />
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-mono text-ash sm:border-l border-white/10 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
            <div className="flex items-center gap-1 text-[11px]">
              <Sliders className="w-3.5 h-3.5 text-cyan-signal" />
              <span>Opacity</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-16 accent-iris-gleam bg-white/10 rounded-full h-1.5 cursor-pointer"
              title="Radar Layer Opacity"
            />
          </div>

        </div>

      </div>

    </section>
  );
}
