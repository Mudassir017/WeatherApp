/**
 * Open-Meteo Weather & Geocoding API Service
 * Midnight Gallery / Origin Financial weather data layer
 */

// WMO Weather Interpretation Code standard map
export const WMO_CODES = {
  0: { label: 'Clear Sky', icon: 'Sun', darkColor: '#847dff' },
  1: { label: 'Mainly Clear', icon: 'SunCloud', darkColor: '#847dff' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', darkColor: '#90b8f0' },
  3: { label: 'Overcast', icon: 'Cloud', darkColor: '#6a6b6b' },
  45: { label: 'Foggy', icon: 'CloudFog', darkColor: '#9f9fa0' },
  48: { label: 'Depositing Rime Fog', icon: 'CloudFog', darkColor: '#9f9fa0' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', darkColor: '#00b3dd' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', darkColor: '#00b3dd' },
  55: { label: 'Dense Drizzle', icon: 'CloudDrizzle', darkColor: '#00b3dd' },
  56: { label: 'Light Freezing Drizzle', icon: 'CloudHail', darkColor: '#d1c9ff' },
  57: { label: 'Dense Freezing Drizzle', icon: 'CloudHail', darkColor: '#d1c9ff' },
  61: { label: 'Slight Rain', icon: 'CloudRain', darkColor: '#00b3dd' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', darkColor: '#00b3dd' },
  65: { label: 'Heavy Rain', icon: 'CloudRainHeavy', darkColor: '#4b49aa' },
  66: { label: 'Light Freezing Rain', icon: 'CloudHail', darkColor: '#d1c9ff' },
  67: { label: 'Heavy Freezing Rain', icon: 'CloudHail', darkColor: '#d1c9ff' },
  71: { label: 'Slight Snow Fall', icon: 'Snowflake', darkColor: '#d1c9ff' },
  73: { label: 'Moderate Snow Fall', icon: 'Snowflake', darkColor: '#d1c9ff' },
  75: { label: 'Heavy Snow Fall', icon: 'Snowflake', darkColor: '#d1c9ff' },
  77: { label: 'Snow Grains', icon: 'Snowflake', darkColor: '#d1c9ff' },
  80: { label: 'Slight Rain Showers', icon: 'CloudRain', darkColor: '#00b3dd' },
  81: { label: 'Moderate Rain Showers', icon: 'CloudRain', darkColor: '#00b3dd' },
  82: { label: 'Violent Rain Showers', icon: 'CloudLightning', darkColor: '#dd90d8' },
  85: { label: 'Slight Snow Showers', icon: 'Snowflake', darkColor: '#d1c9ff' },
  86: { label: 'Heavy Snow Showers', icon: 'Snowflake', darkColor: '#d1c9ff' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', darkColor: '#dd90d8' },
  96: { label: 'Thunderstorm with Slight Hail', icon: 'CloudLightning', darkColor: '#dd90d8' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: 'CloudLightning', darkColor: '#dd90d8' },
};

export function getWeatherCondition(code) {
  return WMO_CODES[code] || { label: 'Unknown', icon: 'Cloud', darkColor: '#9f9fa0' };
}

/**
 * Search locations via Open-Meteo Geocoding API
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=8&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding search failed');
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Location search error:', err);
    return [];
  }
}

/**
 * Reverse geocode lat/lon to location details
 */
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || '';
      return {
        name: city,
        admin1: data.principalSubdivision || '',
        country: country,
        latitude: lat,
        longitude: lon,
      };
    }
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
  }
  return {
    name: 'Selected Location',
    admin1: '',
    country: '',
    latitude: lat,
    longitude: lon,
  };
}

/**
 * Fetch Weather telemetry from Open-Meteo
 */
export async function fetchWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API returned status ${res.status}`);
  const data = await res.json();

  // Try fetching Air Quality API alongside forecast
  let airQuality = null;
  try {
    const aqRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,ozone`
    );
    if (aqRes.ok) {
      const aqData = await aqRes.json();
      airQuality = aqData.current;
    }
  } catch (aqErr) {
    console.warn('Air quality unavailable:', aqErr);
  }

  return {
    ...data,
    airQuality,
  };
}

/**
 * Format UV Index level
 */
export function getUvCategory(uv) {
  if (uv <= 2) return { level: 'Low', color: '#847dff' };
  if (uv <= 5) return { level: 'Moderate', color: '#00b3dd' };
  if (uv <= 7) return { level: 'High', color: '#dd90d8' };
  if (uv <= 10) return { level: 'Very High', color: '#4b49aa' };
  return { level: 'Extreme', color: '#ff5f5f' };
}

/**
 * Format Wind Direction in cardinal direction
 */
export function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round((deg % 360) / 22.5) % 16;
  return directions[idx];
}

/**
 * Format US AQI Rating
 */
export function getAqiCategory(aqi) {
  if (!aqi && aqi !== 0) return { label: 'Good (Est.)', color: '#00b3dd' };
  if (aqi <= 50) return { label: 'Good', color: '#847dff' };
  if (aqi <= 100) return { label: 'Moderate', color: '#00b3dd' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: '#dd90d8' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#4b49aa' };
  return { label: 'Very Unhealthy', color: '#ff5f5f' };
}
