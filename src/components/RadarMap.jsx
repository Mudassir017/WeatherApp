import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Layers, MapPin, Radio, Sliders } from 'lucide-react';

export default function RadarMap({ location }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const radarLayerRef = useRef(null);

  const [radarTimestamps, setRadarTimestamps] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  const [isLoadingRadar, setIsLoadingRadar] = useState(true);

  const lat = location?.latitude || 35.6762;
  const lon = location?.longitude || 139.6503;

  // Fetch RainViewer radar timestamps API
  useEffect(() => {
    async function loadRainViewerData() {
      setIsLoadingRadar(true);
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (res.ok) {
          const data = await res.json();
          // Merge past radar frames + forecast frames
          const radarFrames = [...(data.radar?.past || []), ...(data.radar?.nowcast || [])];
          if (radarFrames.length > 0) {
            setRadarTimestamps(radarFrames);
            setCurrentFrameIdx(radarFrames.length - 1); // Start at latest frame
          }
        }
      } catch (err) {
        console.warn('RainViewer API error:', err);
      } finally {
        setIsLoadingRadar(false);
      }
    }
    loadRainViewerData();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMap.current) return; // Prevent double initialization

    // Dynamically load leaflet instance from window.L
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [lat, lon],
      zoom: 7,
      zoomControl: false,
    });

    // Add CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom Location Marker Icon
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
    marker.bindPopup(`<b style="color: #0f1011;">${location.name}</b><br/>Radar Monitoring Active`);

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    leafletMap.current = map;
    markerRef.current = marker;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update map view when location changes
  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.setView([lat, lon], 8, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.getPopup()?.setContent(`<b style="color: #0f1011;">${location.name}</b><br/>Radar Monitoring Active`);
      }
    }
  }, [lat, lon, location.name]);

  // Update Radar Layer when frame changes or opacity changes
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletMap.current || radarTimestamps.length === 0) return;

    const frame = radarTimestamps[currentFrameIdx];
    if (!frame) return;

    const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${frame.time}/256/{z}/{x}/{y}/2/1_1.png`;

    if (radarLayerRef.current) {
      leafletMap.current.removeLayer(radarLayerRef.current);
    }

    const newRadarLayer = L.tileLayer(radarUrl, {
      opacity: opacity,
      tileSize: 256,
      maxZoom: 18,
      zIndex: 100,
    }).addTo(leafletMap.current);

    radarLayerRef.current = newRadarLayer;
  }, [currentFrameIdx, radarTimestamps, opacity]);

  // Animation Loop for radar playback
  useEffect(() => {
    if (!isPlaying || radarTimestamps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % radarTimestamps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, radarTimestamps.length]);

  // Format frame timestamp
  const currentTimestampStr = radarTimestamps[currentFrameIdx]
    ? new Date(radarTimestamps[currentFrameIdx].time * 1000).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Live';

  return (
    <section id="radar" className="w-full space-y-4 my-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs tracking-mono-wide uppercase text-cyan-signal font-medium flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-signal animate-pulse" />
            <span>LIVE DOPPLER RADAR TELEMETRY</span>
          </span>
          <h3 className="subheading-lyon text-3xl sm:text-4xl text-pure tracking-tight font-normal mt-1">
            Interactive Precipitation Radar
          </h3>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-3">
          <div className="pill-chip-label flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-signal animate-ping" />
            <span>RAINVIEWER METEO FEED</span>
          </div>
        </div>
      </div>

      {/* Map Card Container */}
      <div className="relative w-full rounded-tile bg-graphite border border-white/10 overflow-hidden shadow-origin-lg h-[500px] sm:h-[600px] flex flex-col">
        
        {/* Leaflet Map Div */}
        <div ref={mapRef} className="w-full flex-1 z-0 dark-map" />

        {/* Floating Top Control Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          
          {/* Location Badge */}
          <div className="pointer-events-auto bg-obsidian/85 backdrop-blur-md border border-white/15 px-4 py-2 rounded-btn text-pure flex items-center gap-2 shadow-md">
            <MapPin className="w-4 h-4 text-cyan-signal" />
            <span className="text-sm font-semibold">{location.name}</span>
            <span className="font-mono text-xs text-fog">({lat.toFixed(2)}°, {lon.toFixed(2)}°)</span>
          </div>

          {/* Time Badge */}
          <div className="pointer-events-auto bg-obsidian/85 backdrop-blur-md border border-white/15 px-4 py-2 rounded-btn font-mono text-xs text-pure flex items-center gap-2 shadow-md">
            <span className="text-fog">FRAME TIME:</span>
            <span className="text-cyan-signal font-semibold">{currentTimestampStr}</span>
          </div>

        </div>

        {/* Floating Bottom Radar Animation Controls */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-10 pointer-events-auto bg-obsidian/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-origin-lg flex flex-wrap items-center gap-4 max-w-[500px]">
          
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-btn bg-white/15 hover:bg-white/25 text-pure flex items-center justify-center transition-colors border border-white/10"
            title={isPlaying ? 'Pause Radar Loop' : 'Play Radar Loop'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-pure" />}
          </button>

          {/* Frame Progress Slider */}
          <div className="flex-1 min-w-[140px] space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-fog uppercase">
              <span>Past</span>
              <span>Frame {currentFrameIdx + 1}/{radarTimestamps.length || 1}</span>
              <span>Forecast</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max((radarTimestamps.length || 1) - 1, 0)}
              value={currentFrameIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrameIdx(Number(e.target.value));
              }}
              className="w-full accent-cyan-signal bg-white/10 rounded-full h-1.5 cursor-pointer"
            />
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center gap-2 text-xs font-mono text-ash border-l border-white/10 pl-3">
            <Sliders className="w-3.5 h-3.5 text-cyan-signal" />
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
