/**
 * ============================================================================
 * Weather Service - Real Temperature Based on User Location
 * ============================================================================
 *
 * This service fetches the user's location and retrieves real-time temperature
 * data using the Open-Meteo API (free, no API key required).
 */

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  city?: string;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

/**
 * Get user's location using Geolocation API
 */
const getUserLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        // Fallback to default location (Tokyo)
        resolve({
          latitude: 35.6762,
          longitude: 139.6503,
          city: 'Tokyo (Default)',
        });
      }
    );
  });
};

/**
 * Fetch weather data from Open-Meteo API (free, no API key needed)
 */
const fetchWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&temperature_unit=celsius`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
    };
  } catch (error) {
    // Return default temperature if API fails
    return {
      temperature: 27,
      weatherCode: 0,
      isDay: true,
    };
  }
};

/**
 * Get weather emoji based on WMO weather code
 */
const getWeatherEmoji = (weatherCode: number, isDay: boolean): string => {
  // WMO Weather interpretation codes
  if (weatherCode === 0) return '☀️'; // Clear sky
  if (weatherCode === 1 || weatherCode === 2) return '🌤️'; // Partly cloudy
  if (weatherCode === 3) return '☁️'; // Overcast
  if (weatherCode === 45 || weatherCode === 48) return '🌫️'; // Foggy
  if (weatherCode >= 51 && weatherCode <= 67) return '🌧️'; // Drizzle/Rain
  if (weatherCode >= 71 && weatherCode <= 77) return '❄️'; // Snow
  if (weatherCode >= 80 && weatherCode <= 82) return '🌧️'; // Rain showers
  if (weatherCode >= 85 && weatherCode <= 86) return '❄️'; // Snow showers
  if (weatherCode >= 80 && weatherCode <= 99) return '⛈️'; // Thunderstorm

  return isDay ? '☀️' : '🌙';
};

/**
 * Get real temperature based on user's location
 */
export const getRealTemperature = async (): Promise<{
  temperature: number;
  emoji: string;
  displayText: string;
}> => {
  try {
    const location = await getUserLocation();
    const weather = await fetchWeatherData(location.latitude, location.longitude);
    const emoji = getWeatherEmoji(weather.weatherCode, weather.isDay);

    return {
      temperature: weather.temperature,
      emoji,
      displayText: `${emoji} ${weather.temperature}°`,
    };
  } catch (error) {
    console.error('Error getting temperature:', error);
    return {
      temperature: 27,
      emoji: '☀️',
      displayText: '☀️ 27°',
    };
  }
};

/**
 * Cache weather data to avoid excessive API calls
 */
let cachedWeather: {
  data: Awaited<ReturnType<typeof getRealTemperature>>;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Get cached or fresh temperature data
 */
export const getCachedTemperature = async (): Promise<
  Awaited<ReturnType<typeof getRealTemperature>>
> => {
  const now = Date.now();

  if (cachedWeather && now - cachedWeather.timestamp < CACHE_DURATION) {
    return cachedWeather.data;
  }

  const freshData = await getRealTemperature();
  cachedWeather = { data: freshData, timestamp: now };
  return freshData;
};

